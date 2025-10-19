"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { Trigger } from "@radix-ui/react-select";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { SelectItem } from "@/components/ui/select";
import { chatModels } from "@/lib/ai/models";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { Context } from "./elements/context";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./elements/prompt-input";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  CpuIcon,
  PaperclipIcon,
  StopIcon,
} from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { SuggestedActions } from "./suggested-actions";
import { Button } from "./ui/button";
import type { VisibilityType } from "./visibility-selector";

// Rate limiting hook
function useRateLimit(limitMs: number = 1000) {
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    
    if (timeSinceLastSubmit < limitMs) {
      setIsRateLimited(true);
      setCooldownTime(Math.ceil((limitMs - timeSinceLastSubmit) / 1000));
      
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setCooldownTime(0);
      }, limitMs - timeSinceLastSubmit);
      
      return false;
    }
    
    setLastSubmitTime(now);
    setIsRateLimited(false);
    setCooldownTime(0);
    return true;
  }, [lastSubmitTime, limitMs]);

  return { isRateLimited, cooldownTime, checkRateLimit };
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  onModelChange,
  usage,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  usage?: AppUsage;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { isRateLimited, cooldownTime, checkRateLimit } = useRateLimit(1000); // 1 second rate limit

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustHeight, localStorageInput, setInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const submitForm = useCallback(() => {
    // Check rate limit before submitting
    if (!checkRateLimit()) {
      toast.error(`Please wait ${cooldownTime} second${cooldownTime !== 1 ? 's' : ''} before sending another message.`);
      return;
    }

    window.history.replaceState({}, "", `/chat/${chatId}`);

    sendMessage({
      role: "user",
      parts: [
        ...attachments.map((attachment) => ({
          type: "file" as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: "text",
          text: input,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();
    setInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    resetHeight,
    checkRateLimit,
    cooldownTime,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error("Failed to upload file, please try again!");
    }
  }, []);

  const contextProps = useMemo(
    () => ({
      usage,
    }),
    [usage]
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            sendMessage={sendMessage}
          />
        )}

      <input
        className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />

      <div className="relative">
        <PromptInput
          className={cn(
            "relative w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:shadow-md",
            width && width < 640 ? "p-3" : "p-4"
          )}
          onSubmit={(event) => {
            event.preventDefault();
            if (status !== "ready") {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }}
        >
          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <div
              className={cn(
                "flex flex-row items-end gap-2 overflow-x-auto pb-3 px-1",
                width && width < 640 ? "gap-1.5 pb-2" : "gap-2 pb-3"
              )}
              data-testid="attachments-preview"
            >
              {attachments.map((attachment) => (
                <PreviewAttachment
                  attachment={attachment}
                  key={attachment.url}
                  onRemove={() => {
                    setAttachments((currentAttachments) =>
                      currentAttachments.filter((a) => a.url !== attachment.url)
                    );
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                />
              ))}

              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  attachment={{
                    url: "",
                    name: filename,
                    contentType: "",
                  }}
                  isUploading={true}
                  key={filename}
                />
              ))}
            </div>
          )}
          
          <div className={cn(
            "flex items-end gap-2",
            width && width < 640 ? "gap-1.5" : "gap-2"
          )}>
            <div className="flex items-center gap-1">
              <AttachmentsButton fileInputRef={fileInputRef} status={status} />
            </div>
            
            <div className="flex-1 min-w-0">
              <PromptInputTextarea
                autoFocus
                className={cn(
                  "w-full resize-none border-0 bg-transparent px-3 py-3 text-base leading-relaxed outline-none ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  width && width < 640 ? "px-2.5 py-2.5 text-sm" : "px-3 py-3 text-base"
                )}
                data-testid="multimodal-input"
                disableAutoResize={true}
                maxHeight={200}
                minHeight={24}
                onChange={handleInput}
                placeholder="Send a message..."
                ref={textareaRef}
                rows={1}
                value={input}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Context {...contextProps} />
              {status === "submitted" ? (
                <StopButton setMessages={setMessages} stop={stop} />
              ) : (
                <PromptInputSubmit
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500",
                    width && width < 640 ? "h-7 w-7" : "h-8 w-8"
                  )}
                  disabled={!input.trim() || uploadQueue.length > 0 || isRateLimited}
                  status={status}
                >
                  <ArrowUpIcon size={width && width < 640 ? 16 : 18} />
                </PromptInputSubmit>
              )}
            </div>
          </div>
          
          <PromptInputToolbar className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
            <PromptInputTools className="justify-between w-full">
              <ModelSelectorCompact
                onModelChange={onModelChange}
                selectedModelId={selectedModelId}
              />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
      
      {/* Rate limiting indicator */}
      {isRateLimited && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 rounded-full bg-amber-500/90 px-3 py-1 text-xs text-white shadow-lg animate-pulse">
          Rate limited: {cooldownTime}s
        </div>
      )}
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (!equal(prevProps.attachments, nextProps.attachments)) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }

    return true;
  }
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>["status"];
}) {
  // Enable file uploads for all models including reasoning/student mode
  const isDisabled = status !== "ready";

  return (
    <Button
      className={cn(
        "h-8 w-8 rounded-lg p-0 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300",
        "sm:h-8 sm:w-8"
      )}
      data-testid="attachments-button"
      disabled={isDisabled}
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      variant="ghost"
    >
      <PaperclipIcon size={18} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({
  selectedModelId,
  onModelChange,
}: {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
}) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);
  const { width } = useWindowSize();

  useEffect(() => {
    setOptimisticModelId(selectedModelId);
  }, [selectedModelId]);

  const selectedModel = chatModels.find(
    (model) => model.id === optimisticModelId
  );

  return (
    <PromptInputModelSelect
      onValueChange={(modelName) => {
        const model = chatModels.find((m) => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          onModelChange?.(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id);
          });
        }
      }}
      value={selectedModel?.name}
    >
      <Trigger
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-none transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          width && width < 640 ? "h-6 px-2 text-[10px]" : "h-7 px-2.5 text-xs"
        )}
        type="button"
      >
        <CpuIcon size={width && width < 640 ? 12 : 14} />
        <span className={cn(
          "font-medium truncate max-w-[100px]",
          width && width < 640 ? "hidden" : "hidden sm:inline text-xs"
        )}>
          {selectedModel?.name}
        </span>
        <ChevronDownIcon size={width && width < 640 ? 10 : 12} />
      </Trigger>
      <PromptInputModelSelectContent className="min-w-[260px] p-0">
        <div className="flex flex-col gap-px">
          {chatModels.map((model) => (
            <SelectItem key={model.id} value={model.name}>
              <div className="truncate font-medium text-xs">{model.name}</div>
              <div className="mt-px truncate text-[10px] text-muted-foreground leading-tight">
                {model.description}
              </div>
            </SelectItem>
          ))}
        </div>
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  const { width } = useWindowSize();
  
  return (
    <Button
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 p-0 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600",
        width && width < 640 ? "h-7 w-7" : "h-8 w-8"
      )}
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={width && width < 640 ? 16 : 18} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
