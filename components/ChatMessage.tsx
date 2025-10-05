import React, { useMemo } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { CodeBlock } from './CodeBlock';
import { WandIcon } from './icons/WandIcon';
import { XIcon } from './icons/XIcon';
import { TypingIndicator } from './TypingIndicator';
import { SparklesIcon } from './icons/SparklesIcon';

// This informs TypeScript that 'marked' is a global variable provided by the script in index.html
declare var marked: any;

// Configure marked to handle line breaks and GitHub Flavored Markdown.
if (typeof marked !== 'undefined') {
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
}

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
}

const parseContent = (content: string) => {
  // Split content by code blocks, keeping the delimiters
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    // Check if the part is a code block
    const match = part.match(/^```(\w+)?\n([\s\S]+)```$/);
    if (match) {
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      return { type: 'code', content: code, language, key: `code-${index}` };
    } else {
      // Treat as text if it's not a code block and not empty
      if(part.trim() === '') return null;
      return { type: 'text', content: part, key: `text-${index}` };
    }
  }).filter(Boolean); // Remove any null entries
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isLoading, isLastMessage }) => {
  const isUser = message.role === MessageRole.USER;
  const isModelTyping = message.role === MessageRole.MODEL && message.content === '';
  const showStreamingCursor = isLastMessage && isLoading && message.role === MessageRole.MODEL && message.content !== '';
  
  const parsedParts = useMemo(() => {
    return !isModelTyping ? parseContent(message.content) : [];
  }, [message.content, isModelTyping]);

  if (isUser) {
    return (
      <div className="py-6 px-2 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-300/50 dark:border-zinc-700/50 flex items-center justify-center shadow-sm">
                <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div className="flex-grow pt-1">
              <p className="text-zinc-900 dark:text-zinc-100 font-medium text-base bg-zinc-100/60 dark:bg-zinc-800/40 px-4 py-3 rounded-2xl rounded-l-none border-l-4 border-blue-400/50 shadow-sm">
                {message.content}
              </p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 px-2 animate-in slide-in-from-bottom-2 duration-300 ${showStreamingCursor ? 'pr-8' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
          <div className="relative w-8 h-8 bg-black rounded-full border-2 border-zinc-700/50 flex items-center justify-center shadow-md">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-5 w-5 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow pt-0.5 w-full overflow-hidden">
          <div className="text-zinc-900 dark:text-zinc-100 w-full leading-relaxed">
            {isModelTyping ? (
              <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 shadow-sm">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
                  <div className="relative w-6 h-6 bg-black rounded-full border-2 border-zinc-700/50 flex items-center justify-center">
                    <img 
                      src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                      alt="AJ Studioz Logo" 
                      className="h-4 w-4 rounded-full object-cover animate-bounce"
                    />
                  </div>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 italic font-medium">AJ is crafting a brilliant response...</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {parsedParts.map(part => {
                    if (!part) return null;
                    if (part.type === 'code') {
                      return <CodeBlock key={part.key} language={part.language} code={part.content} />;
                    }
                    // For text parts, parse markdown and render as HTML
                    const html = marked.parse(part.content);
                    return (
                       <div
                          key={part.key}
                          className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-3 prose-pre:my-0 prose-a:text-purple-600 dark:prose-a:text-purple-400 hover:prose-a:underline prose-ul:my-4 prose-ol:my-4 prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:bg-zinc-200/80 dark:prose-code:bg-zinc-800/50 prose-code:rounded-lg prose-code:px-2 prose-code:py-1 prose-code:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-purple-500/60 dark:prose-blockquote:border-purple-400/60 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-blockquote:bg-purple-50/50 dark:prose-blockquote:bg-purple-950/30 prose-table:border-collapse prose-table:border prose-table:border-zinc-300 dark:prose-table:border-zinc-700 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-900 prose-th:font-semibold prose-td:border prose-td:border-zinc-300 dark:prose-td:border-zinc-700 prose-td:px-3 prose-td:py-2 shadow-sm rounded-xl p-4 bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-black/50 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-700/30"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                  })}
                </div>
                {showStreamingCursor && (
                  <div className="inline-flex items-center gap-2 ml-1">
                    <span className="inline-block w-1 h-5 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full animate-pulse"></span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 italic animate-pulse">streaming...</span>
                  </div>
                )}
              </>
            )}
          </div>
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-6 flex gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500/50 rounded-full hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 shadow-sm">
                <SparklesIcon className="h-4 w-4" />
                Enhance Response
                <XIcon className="h-4 w-4 text-white/70 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
