"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { memo, useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
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

// ===== INLINE ICON COMPONENTS =====
const CodeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const EyeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

// ===== INLINE UTILITY FUNCTIONS =====
const extractCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2],
      fullMatch: match[0]
    });
  }
  
  return blocks;
};

const hasHTMLCode = (text: string) => {
  return text.includes('```html') || text.includes('```HTML');
};

const detectLanguage = (code: string) => {
  if (code.includes('<!DOCTYPE') || code.includes('<html')) return 'html';
  if (code.includes('import ') || code.includes('export ')) return 'javascript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('public class ') || code.includes('import java')) return 'java';
  if (code.includes('using System') || code.includes('namespace ')) return 'csharp';
  return 'text';
};

// ===== INLINE CONTEXT PROVIDER =====
interface HTMLPreviewContextType {
  showHTMLPreview: boolean;
  setShowHTMLPreview: (show: boolean) => void;
  htmlContent: string;
  setHTMLContent: (content: string) => void;
}

const HTMLPreviewContext = createContext<HTMLPreviewContextType | undefined>(undefined);

const HTMLPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);
  const [htmlContent, setHTMLContent] = useState("");

  return (
    <HTMLPreviewContext.Provider
      value={{
        showHTMLPreview,
        setShowHTMLPreview,
        htmlContent,
        setHTMLContent,
      }}
    >
      {children}
    </HTMLPreviewContext.Provider>
  );
};

const useHTMLPreview = () => {
  const context = useContext(HTMLPreviewContext);
  if (context === undefined) {
    throw new Error("useHTMLPreview must be used within a HTMLPreviewProvider");
  }
  return context;
};

// ===== TYPING INDICATOR COMPONENT =====
const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 rounded-full bg-blue-500"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// ===== LOADING TEXT COMPONENT =====
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

// ===== TYPEWRITER TEXT COMPONENT =====
const TypewriterText = ({ 
  text, 
  isComplete, 
  speed = 20 
}: { 
  text: string; 
  isComplete: boolean; 
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (isComplete && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete && currentIndex > 0) {
      setDisplayedText("");
      setCurrentIndex(0);
    }
  }, [currentIndex, text, isComplete, speed]);
  
  return (
    <span>
      {displayedText}
      {!isComplete && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  );
};

// ===== CODE BLOCK COMPONENT =====
const CodeBlock = ({ 
  children, 
  language = "text" 
}: { 
  children: string; 
  language?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className="relative my-3 overflow-hidden rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 text-xs">
        <span className="text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-gray-400 hover:bg-gray-800"
        >
          {isCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy code
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
};

// ===== HTML PREVIEW COMPONENT =====
const HTMLPreview = ({ htmlContent }: { htmlContent: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (iframeRef.current && isExpanded) {
      const iframe = iframeRef.current;
      const document = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (document) {
        document.open();
        document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  margin: 0;
                  padding: 16px;
                  color: #333;
                  line-height: 1.6;
                }
                pre {
                  background-color: #f6f8fa;
                  border-radius: 6px;
                  padding: 16px;
                  overflow: auto;
                }
                code {
                  background-color: rgba(175, 184, 193, 0.2);
                  padding: 0.2em 0.4em;
                  border-radius: 3px;
                  font-size: 85%;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                blockquote {
                  border-left: 4px solid #ddd;
                  margin: 0;
                  padding-left: 16px;
                  color: #666;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `);
        document.close();
      }
    }
  }, [htmlContent, isExpanded]);
  
  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <CodeIcon size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            HTML Preview
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {isExpanded ? (
            <>
              <EyeOffIcon size={14} />
              Hide
            </>
          ) : (
            <>
              <EyeIcon size={14} />
              Show
            </>
          )}
        </button>
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
            <div className="border-t border-gray-200 dark:border-gray-700">
              <iframe
                ref={iframeRef}
                className="h-96 w-full border-0 bg-white dark:bg-gray-900"
                title="HTML Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== ENHANCED MESSAGE CONTENT COMPONENT =====
const EnhancedMessageContent = ({ 
  content, 
  isTypingComplete,
  role 
}: { 
  content: string; 
  isTypingComplete: boolean;
  role: string;
}) => {
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);
  
  // Check if content contains HTML code blocks
  const hasHTMLCodeBlock = hasHTMLCode(content);
  
  // Process content to handle code blocks and other formatting
  const processContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
      });
      
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return parts;
  };
  
  const contentParts = processContent(content);
  
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", {
      "prose-p:my-2 prose-p:leading-relaxed": role === "assistant",
    })}>
      {contentParts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock key={index} language={part.language}>
              {part.content}
            </CodeBlock>
          );
        }
        
        return (
          <p key={index} className="whitespace-pre-wrap">
            {role === "assistant" ? (
              <TypewriterText 
                text={part.content} 
                isComplete={isTypingComplete}
              />
            ) : (
              part.content
            )}
          </p>
        );
      })}
      
      {hasHTMLCodeBlock && role === "assistant" && (
        <div className="mt-3">
          <button
            onClick={() => setShowHTMLPreview(!showHTMLPreview)}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
          >
            <EyeIcon size={16} />
            {showHTMLPreview ? "Hide" : "Show"} HTML Preview
          </button>
          
          {showHTMLPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <HTMLPreview htmlContent={content} />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

// ===== THINKING MESSAGE COMPONENT =====
export const ThinkingMessage = () => {
  const role = "assistant";
  const [thinkingStage, setThinkingStage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingStage((prev) => (prev + 1) % 3);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const thinkingTexts = [
    "Thinking...",
    "Analyzing your request...",
    "Generating response..."
  ];

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      initial={{ opacity: 0 }}
    >
      <div className="flex items-start justify-start gap-3">
        <motion.div 
          className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.4)",
              "0 0 0 6px rgba(59, 130, 246, 0)",
              "0 0 0 0 rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <SparklesIcon size={14} />
          </motion.div>
        </motion.div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="p-0 text-muted-foreground text-sm">
            <LoadingText>{thinkingTexts[thinkingStage]}</LoadingText>
          </div>
          <div className="flex items-center gap-2">
            <TypingIndicator />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ===== MAIN PREVIEW MESSAGE COMPONENT =====
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
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Track when typing animation should complete
  useEffect(() => {
    if (!isLoading && message.role === "assistant") {
      setIsTypingComplete(false);
      // Simulate typing completion after a delay
      const timer = setTimeout(() => {
        setIsTypingComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, message.role]);

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  // Enhanced avatar animation for AI assistant
  const assistantAvatarVariants = {
    idle: {
      boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)",
      transition: { duration: 0.5 }
    },
    thinking: {
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0.4)",
        "0 0 0 6px rgba(59, 130, 246, 0)",
        "0 0 0 0 rgba(59, 130, 246, 0)",
      ],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }
    },
    responding: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }
    }
  };

  return (
    <HTMLPreviewProvider>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="group/message w-full"
        data-role={message.role}
        data-testid={`message-${message.role}`}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        ref={messageRef}
      >
        <div
          className={cn("flex w-full items-start gap-1.5 sm:gap-2 md:gap-3", {
            "justify-end": message.role === "user" && mode !== "edit",
            "justify-start": message.role === "assistant",
          })}
        >
          {message.role === "assistant" && (
            <motion.div 
              className="-mt-1 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-400 ring-offset-1 sm:size-8 sm:ring-offset-2 dark:ring-offset-zinc-900"
              variants={assistantAvatarVariants}
              animate={isLoading ? "thinking" : "idle"}
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
                  width={28}
                  height={28}
                  className="object-cover sm:h-8 sm:w-8"
                />
              </motion.div>
            </motion.div>
          )}

          {message.role === "user" && session?.user && (
            <div className="order-2 -mt-1 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-400 ring-offset-1 sm:size-8 sm:ring-offset-2 dark:ring-offset-zinc-900">
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
                {attachmentsFromMessage.map((attachment, index) => (
                  <motion.div
                    key={attachment.url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <PreviewAttachment
                      attachment={{
                        name: attachment.filename ?? "file",
                        contentType: attachment.mediaType,
                        url: attachment.url,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {message.parts?.map((part, index) => {
                const { type } = part;
                const key = `message-${message.id}-part-${index}`;

                if (type === "reasoning" && part.text?.trim().length > 0) {
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
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
                        transition={{ duration: 0.3 }}
                      >
                        <MessageContent
                          className={cn({
                            "w-fit break-words rounded-2xl px-3 py-2.5 text-right text-sm text-white sm:px-4 sm:py-3 sm:text-base shadow-md":
                              message.role === "user",
                            "bg-transparent px-0 py-0 text-left text-sm sm:text-base prose prose-sm dark:prose-invert max-w-none":
                              message.role === "assistant",
                          })}
                          data-testid="message-content"
                          style={
                            message.role === "user"
                              ? { backgroundColor: "#006cff" }
                              : undefined
                          }
                        >
                          {message.role === "assistant" ? (
                            <EnhancedMessageContent 
                              content={sanitizeText(part.text)} 
                              isTypingComplete={isTypingComplete}
                              role={message.role}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap">{sanitizeText(part.text)}</div>
                          )}
                        </MessageContent>
                      </motion.div>
                    );
                  }

                  if (mode === "edit") {
                    return (
                      <motion.div
                        className="flex w-full flex-row items-start gap-3"
                        key={key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
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
                      </motion.div>
                    );
                  }
                }

                if (type === "tool-getWeather") {
                  const { toolCallId, state } = part;

                  return (
                    <motion.div
                      key={toolCallId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Tool defaultOpen={true}>
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
                    </motion.div>
                  );
                }

                if (type === "tool-createDocument") {
                  const { toolCallId } = part;

                  if (part.output && "error" in part.output) {
                    return (
                      <motion.div
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                        key={toolCallId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Error creating document: {String(part.output.error)}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={toolCallId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={part.output}
                      />
                    </motion.div>
                  );
                }

                if (type === "tool-updateDocument") {
                  const { toolCallId } = part;

                  if (part.output && "error" in part.output) {
                    return (
                      <motion.div
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                        key={toolCallId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Error updating document: {String(part.output.error)}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      className="relative"
                      key={toolCallId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DocumentPreview
                        args={{ ...part.output, isUpdate: true }}
                        isReadonly={isReadonly}
                        result={part.output}
                      />
                    </motion.div>
                  );
                }

                if (type === "tool-requestSuggestions") {
                  const { toolCallId, state } = part;

                  return (
                    <motion.div
                      key={toolCallId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Tool defaultOpen={true}>
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
                    </motion.div>
                  );
                }

                return null;
              })}
            </AnimatePresence>

            {!isReadonly && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
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
    </HTMLPreviewProvider>
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
