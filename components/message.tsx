"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState, useEffect } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

// Enhanced typing indicator component
const TypingIndicator = () => (
  <div className="flex space-x-1 px-2 py-1">
    <motion.div
      className="h-2 w-2 bg-current rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0,
      }}
    />
    <motion.div
      className="h-2 w-2 bg-current rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0.2,
      }}
    />
    <motion.div
      className="h-2 w-2 bg-current rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0.4,
      }}
    />
  </div>
);

// Enhanced message timestamp component
const MessageTimestamp = ({ timestamp }: { timestamp: Date | string }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTime("now");
      } else if (diffMins < 60) {
        setTime(`${diffMins}m ago`);
      } else if (diffMins < 1440) {
        setTime(`${Math.floor(diffMins / 60)}h ago`);
      } else {
        setTime(date.toLocaleDateString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className="text-xs text-muted-foreground ml-2">{time}</span>
  );
};

// Enhanced tool result component with better styling
const EnhancedToolResult = ({ 
  type, 
  input, 
  output, 
  state, 
  toolCallId,
  isReadonly 
}: {
  type: string;
  input?: any;
  output?: any;
  state: string;
  toolCallId: string;
  isReadonly: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "tool-getWeather":
        return "🌤️";
      case "tool-createDocument":
        return "📄";
      case "tool-updateDocument":
        return "✏️";
      case "tool-requestSuggestions":
        return "💡";
      default:
        return "🔧";
    }
  };

  const getToolName = (toolType: string) => {
    switch (toolType) {
      case "tool-getWeather":
        return "Weather";
      case "tool-createDocument":
        return "Create Document";
      case "tool-updateDocument":
        return "Update Document";
      case "tool-requestSuggestions":
        return "Request Suggestions";
      default:
        return "Tool";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-2 overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-background to-muted/20 shadow-sm"
    >
      <div
        className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getToolIcon(type)}</span>
          <span className="font-medium">{getToolName(type)}</span>
          {state === "input-available" && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">
              Processing
            </span>
          )}
          {state === "output-available" && (
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
              Complete
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-3">
              {type === "tool-getWeather" && (
                <>
                  {state === "input-available" && (
                    <div className="mb-2 text-sm text-muted-foreground">
                      Requesting weather for: <span className="font-medium">{input.location}</span>
                    </div>
                  )}
                  {state === "output-available" && (
                    <Weather weatherAtLocation={output} />
                  )}
                </>
              )}
              
              {type === "tool-createDocument" && (
                <DocumentPreview isReadonly={isReadonly} result={output} />
              )}
              
              {type === "tool-updateDocument" && (
                <DocumentPreview
                  args={{ ...output, isUpdate: true }}
                  isReadonly={isReadonly}
                  result={output}
                />
              )}
              
              {type === "tool-requestSuggestions" && (
                <>
                  {state === "input-available" && (
                    <div className="mb-2 text-sm text-muted-foreground">
                      Requesting suggestions for: <span className="font-medium">{input.document}</span>
                    </div>
                  )}
                  {state === "output-available" && (
                    "error" in output ? (
                      <div className="rounded border border-red-200 bg-red-50 p-2 text-red-500 dark:bg-red-950/50">
                        Error: {String(output.error)}
                      </div>
                    ) : (
                      <DocumentToolResult
                        isReadonly={isReadonly}
                        result={output}
                        type="request-suggestions"
                      />
                    )
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isHovered, setIsHovered] = useState(false);

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group/message relative w-full px-4 py-6 transition-colors",
        message.role === "user" ? "bg-background" : "bg-gradient-to-b from-background to-muted/10"
      )}
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0, y: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn("mx-auto flex w-full max-w-4xl items-start gap-4", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md">
            <SparklesIcon size={16} className="text-primary-foreground" />
            {isLoading && (
              <motion.div
                className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            )}
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-3": message.parts?.some((p) => p.type === "text" && p.text?.trim()),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some((p) => p.type === "text" && p.text?.trim())) ||
              mode === "edit",
            "max-w-[calc(100%-3rem)] sm:max-w-[min(fit-content,70%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {message.role === "assistant" && (
            <div className="mb-1 flex items-center">
              <span className="font-semibold text-foreground">Assistant</span>
              <MessageTimestamp timestamp={message.createdAt || new Date()} />
            </div>
          )}

          {message.role === "user" && (
            <div className="mb-1 flex items-center justify-end">
              <MessageTimestamp timestamp={message.createdAt || new Date()} />
              <span className="ml-2 font-semibold text-foreground">You</span>
            </div>
          )}

          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MessageReasoning
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                </motion.div>
              );
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <MessageContent
                      className={cn(
                        "relative overflow-hidden rounded-2xl px-4 py-3 shadow-sm transition-all",
                        {
                          "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20":
                            message.role === "user",
                          "bg-background border border-border/40 text-foreground":
                            message.role === "assistant",
                        }
                      )}
                      data-testid="message-content"
                    >
                      {message.role === "user" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-90" />
                      )}
                      <div className="relative">
                        <Response>{sanitizeText(part.text)}</Response>
                        {isLoading && message.role === "assistant" && (
                          <div className="mt-2">
                            <TypingIndicator />
                          </div>
                        )}
                      </div>
                    </MessageContent>
                  </motion.div>
                );
              }

              if (mode === "edit") {
                return (
                  <motion.div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </motion.div>
                );
              }
            }

            // Enhanced tool results
            if (type.startsWith("tool-")) {
              const { toolCallId, state } = part;

              if (type === "tool-createDocument" || type === "tool-updateDocument") {
                if (part.output && "error" in part.output) {
                  return (
                    <motion.div
                      key={toolCallId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="my-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    >
                      Error {type === "tool-createDocument" ? "creating" : "updating"} document:{" "}
                      {String(part.output.error)}
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={toolCallId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {type === "tool-createDocument" ? (
                      <DocumentPreview isReadonly={isReadonly} result={part.output} />
                    ) : (
                      <div className="relative">
                        <DocumentPreview
                          args={{ ...part.output, isUpdate: true }}
                          isReadonly={isReadonly}
                          result={part.output}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              }

              // Use enhanced tool result component for other tools
              return (
                <EnhancedToolResult
                  key={toolCallId}
                  type={type}
                  input={part.input}
                  output={part.output}
                  state={state}
                  toolCallId={toolCallId}
                  isReadonly={isReadonly}
                />
              );
            }

            return null;
          })}

          {!isReadonly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <MessageActions
                chatId={chatId}
                isLoading={isLoading}
                key={`action-${message.id}`}
                message={message}
                setMode={setMode}
                vote={vote}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message relative w-full px-4 py-6 bg-gradient-to-b from-background to-muted/10"
      data-role={role}
      data-testid="message-assistant-loading"
      initial={{ opacity: 0 }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-start gap-4 justify-start">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md">
          <SparklesIcon size={16} className="text-primary-foreground" />
          <motion.div
            className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="mb-1 flex items-center">
            <span className="font-semibold text-foreground">Assistant</span>
            <MessageTimestamp timestamp={new Date()} />
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-background border border-border/40 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </motion.div>
              <LoadingText>Thinking...</LoadingText>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{ backgroundPosition: ["100% 50%", "-100% 50%"] }}
      className="flex items-center text-transparent"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 35%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 65%, hsl(var(--muted-foreground)) 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
};
