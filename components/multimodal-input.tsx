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

// Enhanced Rate Limit Hook with Circular Progress
function useRateLimit(limitMs: number = 1000) {
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [progress, setProgress] = useState(100);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    
    if (timeSinceLastSubmit < limitMs) {
      setIsRateLimited(true);
      const remainingTime = limitMs - timeSinceLastSubmit;
      setCooldownTime(Math.ceil(remainingTime / 1000));
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - now;
        const newProgress = Math.min(100, (elapsed / limitMs) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 50);
      
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setCooldownTime(0);
        setProgress(100);
      }, remainingTime);
      
      return false;
    }
    
    setLastSubmitTime(now);
    setIsRateLimited(false);
    setCooldownTime(0);
    setProgress(100);
    return true;
  }, [lastSubmitTime, limitMs]);

  return { isRateLimited, cooldownTime, progress, checkRateLimit };
}

// Circular Progress Component
const CircularProgress = ({ 
  progress, 
  size = 20, 
  strokeWidth = 2,
  className 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  className?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-150 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {progress < 100 && (
        <span className="absolute text-xs font-medium text-primary">
          {Math.ceil(progress)}
        </span>
      )}
    </div>
  );
};

// Inline Attachment Preview Component
const InlineAttachmentPreview = ({ 
  attachment, 
  onRemove 
}: { 
  attachment: Attachment; 
  onRemove: () => void;
}) => {
  return (
    <div className="group relative inline-flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-2 text-sm text-gray-300 backdrop-blur-sm border border-gray-700/50">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-700">
        <PaperclipIcon size={12} />
      </div>
      <span className="max-w-[120px] truncate text-xs">{attachment.name}</span>
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex hover:bg-red-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

// Inline Upload Progress Component
const InlineUploadProgress = ({ filename }: { filename: string }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-2 text-sm text-gray-300 backdrop-blur-sm border border-gray-700/50">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-700">
        <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></div>
      </div>
      <span className="max-w-[120px] truncate text-xs">{filename}</span>
    </div>
  );
};

// Enhanced Model Selector with Inline Design
const InlineModelSelector = ({
  selectedModelId,
  onModelChange,
}: {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
}) => {
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
          "inline-flex h-7 items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800/50 px-2.5 text-xs font-medium text-gray-300 backdrop-blur-sm transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/70 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          width && width < 640 ? "h-6 px-2 text-[10px]" : "h-7 px-2.5 text-xs"
        )}
        type="button"
      >
        <CpuIcon size={width && width < 640 ? 10 : 12} />
        <span className="font-medium truncate max-w-[60px]">
          {selectedModel?.name}
        </span>
        <ChevronDownIcon size={width && width < 640 ? 10 : 12} />
      </Trigger>
      <PromptInputModelSelectContent className="min-w-[200px] p-0 border-gray-700 bg-gray-900/95 backdrop-blur-xl">
        <div className="flex flex-col gap-px">
          {chatModels.map((model) => (
            <SelectItem key={model.id} value={model.name} className="text-xs">
              <div className="truncate font-medium text-gray-100">{model.name}</div>
              <div className="mt-px truncate text-[10px] text-gray-400 leading-tight">
                {model.description}
              </div>
            </SelectItem>
          ))}
        </div>
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
};

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
  const { isRateLimited, cooldownTime, progress, checkRateLimit } = useRateLimit(1000);

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
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
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
    <div className={cn("relative w-full", className)}>
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
          "group relative rounded-2xl border border-gray-700/50 bg-gray-900/50 p-2.5 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-gray-600/50 hover:shadow-2xl hover:shadow-black/30 focus-within:border-primary focus-within:shadow-2xl focus-within:shadow-primary/20 dark:bg-gray-900/50 dark:shadow-black/40",
          width && width < 640 ? "p-2" : "p-2.5"
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
        {/* Inline Attachments and Upload Queue */}
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {attachments.map((attachment) => (
              <InlineAttachmentPreview
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
              <InlineUploadProgress filename={filename} key={filename} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <Button
            className={cn(
              "aspect-square h-8 rounded-xl p-0 text-gray-400 transition-all duration-200 hover:bg-gray-800/50 hover:text-gray-200",
              width && width < 640 ? "h-7" : "h-8"
            )}
            data-testid="attachments-button"
            disabled={status !== "ready"}
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            variant="ghost"
          >
            <PaperclipIcon size={width && width < 640 ? 16 : 18} />
          </Button>

          {/* Text Input */}
          <PromptInputTextarea
            autoFocus
            className={cn(
              "grow resize-none border-0 bg-transparent px-3 py-2 text-sm leading-relaxed outline-none ring-0 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              width && width < 640 ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
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

          {/* Context Indicator */}
          <Context {...contextProps} />

          {/* Submit/Stop Button with Rate Limit Indicator */}
          <div className="relative">
            {status === "submitted" ? (
              <Button
                className={cn(
                  "h-8 rounded-xl bg-red-500/20 p-0 text-red-400 transition-all duration-200 hover:bg-red-500/30 hover:text-red-300",
                  width && width < 640 ? "h-7" : "h-8"
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
            ) : (
              <div className="relative">
                <Button
                  className={cn(
                    "h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-0 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 disabled:scale-100 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none",
                    width && width < 640 ? "h-7" : "h-8"
                  )}
                  disabled={!input.trim() || uploadQueue.length > 0 || isRateLimited}
                  onClick={(event) => {
                    event.preventDefault();
                    submitForm();
                  }}
                >
                  <ArrowUpIcon size={width && width < 640 ? 16 : 18} />
                </Button>
                
                {/* Rate Limit Circular Progress Overlay */}
                {isRateLimited && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CircularProgress 
                      progress={progress} 
                      size={width && width < 640 ? 28 : 32}
                      strokeWidth={2}
                      className="text-gray-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inline Toolbar */}
        <PromptInputToolbar className="border-t border-gray-700/50 p-0 pt-2">
          <PromptInputTools className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <InlineModelSelector
                onModelChange={onModelChange}
                selectedModelId={selectedModelId}
              />
            </div>
            
            {/* Rate Limit Status */}
            {isRateLimited && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CircularProgress 
                  progress={progress} 
                  size={16}
                  strokeWidth={1.5}
                  className="text-gray-600"
                />
                <span>Rate limited: {cooldownTime}s</span>
              </div>
            )}
          </PromptInputTools>
        </PromptInputToolbar>
      </PromptInput>
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
