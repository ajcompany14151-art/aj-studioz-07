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
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
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
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
          <AJStudiozIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300"/>
        </div>
        <div className="flex-grow pt-0.5 w-full overflow-hidden">
          <div className="text-zinc-900 dark:text-zinc-200 w-full leading-relaxed">
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
                        className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-sky-500 dark:prose-a:text-sky-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3"
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
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors">
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