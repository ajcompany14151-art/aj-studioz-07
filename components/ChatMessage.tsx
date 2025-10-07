// components/ChatMessage.tsx
import React, { useMemo, useState } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { CodeBlock } from './CodeBlock';
import { WandIcon } from './icons/WandIcon';
import { XIcon } from './icons/XIcon';
import { TypingIndicator } from './TypingIndicator';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { ShareIcon } from './icons/ShareIcon';

// This informs TypeScript that 'marked' is a global variable provided by the script in index.html
declare var marked: any;

// Configure marked to handle line breaks and GitHub Flavored Markdown.
if (typeof marked !== 'undefined') {
  marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: true,
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
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isUser = message.role === MessageRole.USER;
  const isModelTyping = message.role === MessageRole.MODEL && message.content === '';
  const showStreamingCursor = isLastMessage && isLoading && message.role === MessageRole.MODEL && message.content !== '';
  
  const parsedParts = useMemo(() => {
    return !isModelTyping ? parseContent(message.content) : [];
  }, [message.content, isModelTyping]);

  // Enhancement: Add timestamp to messages
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Here you would typically send this feedback to your backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shared from AJ Studioz',
        text: message.content,
      }).catch(err => console.log('Error sharing', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isUser) {
    return (
      <div className="py-6 px-2 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800/50 dark:bg-zinc-900/50 border border-zinc-700/50 dark:border-zinc-700/50 flex items-center justify-center shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <UserIcon className="h-5 w-5 text-zinc-300 dark:text-white relative z-10" />
            </div>
            <div className="flex-grow">
              <div className="relative group">
                <p className="pt-1 text-white font-medium text-base leading-relaxed">
                    {message.content}
                </p>
                <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-300"
                    aria-label="Copy message"
                  >
                    {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
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
          <div className="relative w-8 h-8 bg-black rounded-full border border-zinc-700/50 flex items-center justify-center overflow-hidden group">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-5 w-5 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
        <div className="flex-grow pt-0.5 w-full overflow-hidden">
          <div className="text-white w-full leading-relaxed">
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
                        className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-sky-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-code:text-zinc-200 prose-code:bg-zinc-800/50 prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-semibold prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-300 prose-table:border-collapse prose-table:border prose-table:border-zinc-700 prose-th:bg-zinc-900 prose-th:font-semibold prose-td:border prose-td:border-zinc-700 prose-td:px-2 prose-td:py-1 selection:bg-purple-500/30"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                  );
                })}
                {showStreamingCursor && <span className="inline-block w-1 h-5 ml-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full animate-pulse align-[-3px]"></span>}
              </>
            )}
            {!isModelTyping && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 opacity-70">{timestamp}</p>}
          </div>
          
          {/* Enhanced action buttons */}
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900/50 text-zinc-300 border border-zinc-700/50 rounded-full hover:bg-zinc-800/50 hover:text-white transition-all duration-300 group">
                <WandIcon className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                Think Harder
                <XIcon className="h-3.5 w-3.5 text-zinc-500" />
              </button>
              
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-purple-300 border border-purple-700/50 rounded-full hover:from-purple-800/50 hover:to-blue-800/50 hover:text-purple-200 transition-all duration-300 group">
                <svg className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate
              </button>
              
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900/50 text-zinc-300 border border-zinc-700/50 rounded-full hover:bg-zinc-800/50 hover:text-white transition-all duration-300 group"
              >
                {isCopied ? <CheckIcon className="h-3.5 w-3.5 text-green-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900/50 text-zinc-300 border border-zinc-700/50 rounded-full hover:bg-zinc-800/50 hover:text-white transition-all duration-300 group"
              >
                <ShareIcon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                Share
              </button>
              
              <div className="flex items-center gap-1 border-l border-zinc-700/50 pl-2 ml-1">
                <button
                  onClick={() => handleFeedback('up')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${feedback === 'up' ? 'bg-green-900/30 text-green-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                  aria-label="Good response"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${feedback === 'down' ? 'bg-red-900/30 text-red-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                  aria-label="Bad response"
                >
                  <ThumbsDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
