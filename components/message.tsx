"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { memo, useState } from "react";
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
  const { data: session } = useSession();

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-1.5 sm:gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <motion.div 
            className="group relative -mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-lg sm:size-10 sm:rounded-2xl"
            animate={isLoading ? {
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.6)",
                "0 0 0 8px rgba(147, 51, 234, 0.3)",
                "0 0 0 12px rgba(236, 72, 153, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)",
              ],
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2.5,
              repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={isLoading ? {
                opacity: [1, 0.8, 1],
                rotate: [0, 180, 360],
              } : {}}
              transition={{
                duration: 3,
                repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
              className="relative size-full overflow-hidden rounded-lg bg-background sm:rounded-xl"
            >
              <Image
                src="/logo.jpg"
                alt="AJ STUDIOZ AI"
                width={32}
                height={32}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
              )}
            </motion.div>
          </motion.div>
        )}

        {message.role === "user" && session?.user && (
          <div className="group order-2 -mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-0.5 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl sm:size-10 sm:rounded-2xl dark:from-gray-600 dark:via-gray-700 dark:to-gray-800">
            <div className="size-full overflow-hidden rounded-lg sm:rounded-xl">
              <Image
                src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="size-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-110 sm:rounded-xl"
                unoptimized
              />
            </div>
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
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
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <MessageContent
                      className={cn({
                        "group relative w-fit break-words rounded-2xl px-4 py-3 text-right text-sm text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl sm:px-5 sm:py-4 sm:text-base":
                          message.role === "user",
                        "relative rounded-2xl bg-gradient-to-br from-muted/30 via-muted/20 to-background/80 px-4 py-3 text-left text-sm backdrop-blur-sm transition-all duration-300 hover:from-muted/40 hover:via-muted/30 hover:to-background/90 sm:px-6 sm:py-4 sm:text-base":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { 
                              background: "linear-gradient(135deg, #006cff 0%, #0052cc 50%, #003d99 100%)",
                              boxShadow: "0 4px 20px rgba(0, 108, 255, 0.25)"
                            }
                          : undefined
                      }
                    >
                      {message.role === "user" && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
                      )}
                      {message.role === "assistant" && (
                        <>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
                          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        </>
                      )}
                      <div className="relative z-10">
                        <Response>{sanitizeText(part.text)}</Response>
                      </div>
                    </MessageContent>
                  </motion.div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
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
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      initial={{ opacity: 0 }}
    >
      <div className="flex items-start justify-start gap-3 sm:gap-4">
        {/* Enhanced AI Avatar with Pulsing Animation */}
        <motion.div 
          className="relative -mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-lg sm:size-10 sm:rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.6)",
              "0 0 0 8px rgba(147, 51, 234, 0.3)",
              "0 0 0 12px rgba(236, 72, 153, 0.1)",
              "0 0 0 16px rgba(59, 130, 246, 0)",
            ],
            scale: [1, 1.05, 1.1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative size-full overflow-hidden rounded-lg bg-background sm:rounded-xl"
          >
            <Image
              src="/logo.jpg"
              alt="AJ STUDIOZ AI"
              width={32}
              height={32}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-pulse" />
          </motion.div>
        </motion.div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          {/* Enhanced Thinking Bubble */}
          <motion.div 
            className="relative rounded-2xl bg-gradient-to-br from-muted/40 via-muted/30 to-background/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Gradient Border */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
            
            {/* Background Gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            
            <div className="relative z-10 flex items-center gap-3">
              <LoadingText>AJ STUDIOZ is thinking</LoadingText>
              
              {/* Animated Dots */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="size-1.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{ 
        backgroundPosition: ["200% 0%", "-200% 0%"],
      }}
      className="flex items-center text-transparent font-medium"
      style={{
        background:
          "linear-gradient(110deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 25%, rgb(236, 72, 153) 50%, rgb(147, 51, 234) 75%, rgb(59, 130, 246) 100%)",
        backgroundSize: "400% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
};
