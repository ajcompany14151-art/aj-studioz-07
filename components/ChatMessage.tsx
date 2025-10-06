// components/ChatMessage.tsx
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
    sanitize: true, // Enhancement: Basic sanitization
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

  // Enhancement: Add timestamp to messages
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="py-6 px-2 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/50 flex items-center justify-center shadow-sm">
                <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div className="flex-grow">
              <p className="pt-1 text-zinc-900 dark:text-white font-medium text-base leading-relaxed">
                  {message.content}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 opacity-70">{timestamp}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 px-2 animate-in slide-in-from-left-2 duration-300 ${showStreamingCursor ? 'pr-4' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
          <div className="relative w-8 h-8 bg-black rounded-full border border-zinc-700/50 flex items-center justify-center">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-5 w-5 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow pt-0.5 w-full overflow-hidden">
          <div className="text-zinc-900 dark:text-white w-full leading-relaxed">
            {isModelTyping ? (
              <TypingIndicator />
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
                        className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-sky-500 dark:prose-a:text-sky-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:bg-zinc-200/80 dark:prose-code:bg-zinc-800/50 prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 dark:prose-blockquote:border-purple-400/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-table:border-collapse prose-table:border prose-table:border-zinc-300 dark:prose-table:border-zinc-700 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-900 prose-th:font-semibold prose-td:border prose-td:border-zinc-300 dark:prose-td:border-zinc-700 prose-td:px-2 prose-td:py-1 selection:bg-purple-200/50 dark:selection:bg-purple-500/30"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                  );
                })}
                {showStreamingCursor && <span className="inline-block w-1 h-5 ml-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full animate-pulse align-[-3px]"></span>}
              </>
            )}
            {!isModelTyping && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 opacity-70">{timestamp}</p>}
          </div>
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-4 flex gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                <WandIcon className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                Think Harder
                <XIcon className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              </button>
              {/* Enhancement: Add regenerate button */}
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50 rounded-full hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
