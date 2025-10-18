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

// HTML Preview Component
const HTMLPreview = ({ html }: { html: string }) => {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-sm">
      <div 
        className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-100 prose-code:text-purple-400 prose-blockquote:border-l-purple-500 prose-blockquote:bg-gray-800/50 prose-blockquote:p-2 prose-blockquote:rounded prose-blockquote:italic"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
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
  const [showHTML, setShowHTML] = useState(false);
  const { data: session } = useSession();

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  // Check if message contains HTML
  const hasHTML = message.parts.some(
    (part) => part.type === "text" && "text" in part && part.text?.includes("<")
  );

  // Extract HTML content
  const htmlContent = message.parts.find(
    (part) => part.type === "text" && "text" in part && part.text?.includes("<")
  ) as { type: "text"; text: string } | undefined;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group/message w-full px-4 py-3 sm:px-6"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn("flex w-full items-start gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <motion.div 
            className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25"
            animate={isLoading ? {
              boxShadow: [
                "0 0 0 0 rgba(147, 51, 234, 0.4)",
                "0 0 0 8px rgba(147, 51, 234, 0)",
                "0 0 0 0 rgba(147, 51, 234, 0)",
              ],
            } : {}}
            transition={{
              duration: 2,
              repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={isLoading ? {
                opacity: [1, 0.7, 1],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
              className="relative size-full"
            >
              <Image
                src="/logo.jpg"
                alt="AI Avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}

        {message.role === "user" && session?.user && (
          <div className="order-2 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-600 to-gray-700">
            <Image
              src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="size-full rounded-full object-cover"
              unoptimized
            />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-3": message.parts?.some(
              (p) => p.type === "text" && "text" in p && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && "text" in p && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-3.5rem)] sm:max-w-[min(fit-content,80%)]":
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

            if (type === "reasoning" && "text" in part && part.text?.trim().length > 0) {
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
                  <div key={key} className="relative">
                    <MessageContent
                      className={cn({
                        "w-fit break-words rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-right text-sm text-white shadow-lg shadow-blue-600/20 sm:px-5 sm:py-3 sm:text-base sm:rounded-3xl":
                          message.role === "user",
                        "relative w-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-3 text-left text-sm text-gray-100 shadow-lg shadow-gray-900/20 sm:px-5 sm:py-4 sm:text-base sm:rounded-3xl":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                    >
                      {message.role === "assistant" && (
                        <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                      )}
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                    
                    {/* HTML Preview Toggle */}
                    {message.role === "assistant" && hasHTML && (
                      <button
                        onClick={() => setShowHTML(!showHTML)}
                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-gray-800/50 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        {showHTML ? "Hide" : "Show"} HTML Preview
                      </button>
                    )}
                    
                    {/* HTML Preview */}
                    {message.role === "assistant" && showHTML && htmlContent && (
                      <HTMLPreview html={htmlContent.text} />
                    )}
                  </div>
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

            if (type === "tool-getWeather" && "toolCallId" in part && "state" in part) {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && "input" in part && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && "output" in part && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument" && "toolCallId" in part) {
              const { toolCallId } = part;

              if ("output" in part && part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400"
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
                  result={"output" in part ? part.output : undefined}
                />
              );
            }

            if (type === "tool-updateDocument" && "toolCallId" in part) {
              const { toolCallId } = part;

              if ("output" in part && part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={("output" in part && part.output) ? { ...part.output, isUpdate: true } : {}}
                    isReadonly={isReadonly}
                    result={"output" in part ? part.output : undefined}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions" && "toolCallId" in part && "state" in part) {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && "input" in part && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && "output" in part && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border border-red-500/30 bg-red-900/20 p-2 text-red-400">
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
      animate={{ opacity: 1, y: 0 }}
      className="group/message w-full px-4 py-3 sm:px-6"
      data-role={role}
      data-testid="message-assistant-loading"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-start gap-3">
        <motion.div 
          className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(147, 51, 234, 0.4)",
              "0 0 0 8px rgba(147, 51, 234, 0)",
              "0 0 0 0 rgba(147, 51, 234, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="text-white">
            <SparklesIcon size={16} />
          </div>
        </motion.div>

        <div className="flex w-full flex-col gap-2 md:gap-3">
          <div className="relative w-fit rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-3 text-sm text-gray-100 shadow-lg shadow-gray-900/20 sm:px-5 sm:py-4 sm:text-base sm:rounded-3xl">
            <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-gradient-to-br from-gray-800 to-gray-900"></div>
            <LoadingText>Thinking...</LoadingText>
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
          "linear-gradient(90deg, #9ca3af 0%, #9ca3af 35%, #e5e7eb 50%, #9ca3af 65%, #9ca3af 100%)",
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
