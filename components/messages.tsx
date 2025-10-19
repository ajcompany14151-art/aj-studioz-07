import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { ArrowDownIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useDataStream();

  // Auto-scroll when status changes
  useEffect(() => {
    if (status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  // Auto-scroll during streaming - enhanced for smooth scrolling
  useEffect(() => {
    if (status === "streaming") {
      const container = messagesContainerRef.current;
      if (!container) return;

      let isActive = true;
      let animationFrameId: number;
      
      const smoothScroll = () => {
        if (!isActive) return;
        
        // Only auto-scroll if user is near the bottom
        const isNearBottom = 
          container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        
        if (isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
        
        // Continue scrolling while streaming and active
        if (isActive) {
          animationFrameId = requestAnimationFrame(smoothScroll);
        }
      };

      // Start the smooth scroll loop
      animationFrameId = requestAnimationFrame(smoothScroll);

      return () => {
        isActive = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      className="relative flex-1 overflow-y-auto overscroll-behavior-contain -webkit-overflow-scrolling-touch touch-pan-y"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_transparent_70%,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>
      
      <Conversation className="relative mx-auto flex min-w-0 max-w-4xl flex-col gap-4 sm:gap-6 md:gap-8">
        <ConversationContent className="flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:py-6 md:gap-8 md:px-4">
          {messages.length === 0 && <Greeting />}
          
          {/* Enhanced AJ STUDIOZ Branding */}
          <div className="flex items-center justify-center py-2 sm:py-3">
            <div className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2 transition-all duration-300 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20 sm:gap-3 sm:px-6 sm:py-3">
              <div className="relative">
                <img 
                  src="/logo.jpg"
                  alt="AJ STUDIOZ Logo"
                  className="h-6 w-6 rounded-lg transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8"
                />
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-20" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-sm font-medium text-transparent sm:text-base">
                Powered by <span className="font-bold">AJ STUDIOZ</span>
              </span>
            </div>
          </div>

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              regenerate={regenerate}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
              setMessages={setMessages}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {status === "submitted" &&
            messages.length > 0 &&
            messages.at(-1)?.role === "user" &&
            selectedModelId !== "chat-model-reasoning" && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </ConversationContent>
      </Conversation>

      {!isAtBottom && (
        <button
          aria-label="Scroll to bottom"
          className="group absolute bottom-32 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border/50 bg-background/80 p-2 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 sm:bottom-40 sm:p-3"
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDownIcon className="size-4 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 sm:size-5" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-10" />
        </button>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
