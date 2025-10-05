import React, { useMemo } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { CodeBlock } from './CodeBlock';
import { WandIcon } from './icons/WandIcon';
import { XIcon } from './icons/XIcon';
import { TypingIndicator } from './TypingIndicator';

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
      <div className="py-6 px-2">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>
            <p className="flex-grow pt-1 text-zinc-900 dark:text-zinc-50 font-medium text-base">
                {message.content}
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 px-2`}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/25"></div>
          <div className="relative w-8 h-8 bg-white dark:bg-black rounded-full border border-zinc-300 dark:border-zinc-900 flex items-center justify-center">
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
              <div className="flex items-center gap-2 py-2">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/25"></div>
                  <div className="relative w-6 h-6 bg-white dark:bg-black rounded-full border border-zinc-300 dark:border-zinc-900 flex items-center justify-center">
                    <img 
                      src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                      alt="AJ Studioz Logo" 
                      className="h-4 w-4 rounded-full object-cover animate-pulse"
                    />
                  </div>
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 italic">AI is thinking...</span>
              </div>
            ) : (
              <>
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
                        className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-sky-500 dark:prose-a:text-sky-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:bg-zinc-200/80 dark:prose-code:bg-zinc-800/50 prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-table:border-collapse prose-table:border prose-table:border-zinc-300 dark:prose-table:border-zinc-700 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-900 prose-th:font-semibold prose-td:border prose-td:border-zinc-300 dark:prose-td:border-zinc-700 prose-td:px-2 prose-td:py-1"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                  );
                })}
                {showStreamingCursor && <span className="inline-block w-1 h-5 ml-1 bg-zinc-900/90 dark:bg-white/90 rounded-full animate-pulse align-[-3px]"></span>}
              </>
            )}
          </div>
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-4">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-900 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <WandIcon className="h-3.5 w-3.5" />
                Think Harder
                <XIcon className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
