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
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
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

      <PromptInput
        className={cn(
          "group relative rounded-3xl border border-border/50 bg-card/50 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 focus-within:border-primary focus-within:shadow-2xl focus-within:shadow-primary/20 sm:p-4 dark:bg-card/30 dark:shadow-black/30",
          width && width < 640 ? "p-2.5" : "p-3 sm:p-4"
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
              "flex flex-row items-end gap-2 overflow-x-scroll px-1 pb-2",
              width && width < 640 ? "gap-1.5" : "gap-2"
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
          "flex flex-row items-end gap-1 sm:gap-2",
          width && width < 640 ? "gap-1" : "gap-1 sm:gap-2"
        )}>
          <AttachmentsButton fileInputRef={fileInputRef} status={status} />
          <PromptInputTextarea
            autoFocus
            className={cn(
              "grow resize-none border-0! bg-transparent px-3 py-2.5 text-base leading-relaxed outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden",
              width && width < 640 ? "px-2.5 py-2 text-sm" : "px-3 py-2.5 text-base"
            )}
            data-testid="multimodal-input"
            disableAutoResize={true}
            maxHeight={200}
            minHeight={24}
            onChange={handleInput}
            placeholder="Ask me anything..."
            ref={textareaRef}
            rows={1}
            value={input}
          />
          <Context {...contextProps} />
          {status === "submitted" ? (
            <StopButton setMessages={setMessages} stop={stop} />
          ) : (
            <PromptInputSubmit
              className={cn(
                "size-9 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 disabled:scale-100 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
                width && width < 640 ? "size-8" : "size-9"
              )}
              disabled={!input.trim() || uploadQueue.length > 0 || isRateLimited}
              status={status}
            >
              <ArrowUpIcon size={width && width < 640 ? 18 : 20} />
            </PromptInputSubmit>
          )}
        </div>
        <PromptInputToolbar className={cn(
          "!border-top-0 border-t-0! p-0 pt-0.5 shadow-none sm:pt-1 dark:border-0 dark:border-transparent!",
          width && width < 640 ? "pt-0.5" : "pt-0.5 sm:pt-1"
        )}>
          <PromptInputTools className={cn(
            "gap-0.5 sm:gap-1 md:gap-1.5",
            width && width < 640 ? "gap-0.5" : "gap-0.5 sm:gap-1 md:gap-1.5"
          )}>
            <ModelSelectorCompact
              onModelChange={onModelChange}
              selectedModelId={selectedModelId}
            />
          </PromptInputTools>
        </PromptInputToolbar>
      </PromptInput>
      
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
        "aspect-square rounded-2xl p-2 text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground",
        "sm:size-9 size-8"
      )}
      data-testid="attachments-button"
      disabled={isDisabled}
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      variant="ghost"
    >
      <PaperclipIcon size={20} />
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
          "flex h-8 items-center gap-1.5 rounded-2xl border border-border/50 bg-muted/30 px-3 text-xs font-medium text-foreground shadow-none transition-all duration-300 hover:border-primary/50 hover:bg-muted/50 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          width && width < 640 ? "h-7 px-2.5 text-[10px]" : "h-8 px-3 text-xs"
        )}
        type="button"
      >
        <CpuIcon size={width && width < 640 ? 12 : 14} />
        <span className={cn(
          "font-semibold",
          width && width < 640 ? "hidden" : "hidden sm:inline text-xs"
        )}>
          {selectedModel?.name}
        </span>
        <ChevronDownIcon size={width && width < 640 ? 12 : 14} />
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
        "rounded-2xl bg-destructive p-2 text-destructive-foreground shadow-lg shadow-destructive/30 transition-all duration-300 hover:scale-105 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/40 disabled:bg-muted disabled:text-muted-foreground",
        width && width < 640 ? "size-8" : "size-9"
      )}
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={width && width < 640 ? 18 : 20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
