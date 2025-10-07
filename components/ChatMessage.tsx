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

// Theme configurations
const themeConfigs = {
  dark: {
    userBg: 'bg-zinc-800',
    userBorder: 'border-zinc-700',
    aiBg: 'bg-zinc-900/60',
    aiBorder: 'border-zinc-800/50',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    codeTheme: 'atom-one-dark'
  },
  light: {
    userBg: 'bg-gray-100',
    userBorder: 'border-gray-200',
    aiBg: 'bg-white',
    aiBorder: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    codeTheme: 'atom-one-light'
  },
  'z-ai': {
    userBg: 'bg-slate-800',
    userBorder: 'border-slate-700',
    aiBg: 'bg-slate-900/60',
    aiBorder: 'border-slate-800/50',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    codeTheme: 'vs2015'
  },
  'chatgpt': {
    userBg: 'bg-gray-800',
    userBorder: 'border-gray-700',
    aiBg: 'bg-gray-900/60',
    aiBorder: 'border-gray-800/50',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    codeTheme: 'github-dark'
  }
};

// Simple ThumbsUpIcon component
const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);

// Simple ThumbsDownIcon component
const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
  </svg>
);

// Simple ShareIcon component
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
  </svg>
);

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
  theme?: string;
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

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isLoading, isLastMessage, theme = 'dark' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isUser = message.role === MessageRole.USER;
  const isModelTyping = message.role === MessageRole.MODEL && message.content === '';
  const showStreamingCursor = isLastMessage && isLoading && message.role === MessageRole.MODEL && message.content !== '';
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
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
        <div className="flex items-start gap-4 max-w-4xl ml-auto">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-grow min-w-0">
              <div className={`p-4 rounded-2xl ${currentThemeConfig.userBg} border ${currentThemeConfig.userBorder} shadow-sm`}>
                <p className={`${currentThemeConfig.text} whitespace-pre-wrap break-words`}>
                  {message.content}
                </p>
              </div>
              <p className={`text-xs ${currentThemeConfig.textSecondary} mt-1 text-right opacity-70`}>{timestamp}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 px-2 animate-in slide-in-from-left-2 duration-300 ${showStreamingCursor ? 'pr-4' : ''}`}>
      <div className="flex items-start gap-4 max-w-4xl">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
          <div className={`relative w-8 h-8 ${theme === 'light' ? 'bg-white' : 'bg-black'} rounded-full border ${currentThemeConfig.aiBorder} flex items-center justify-center overflow-hidden group`}>
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-5 w-5 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
        <div className="flex-grow pt-0.5 w-full overflow-hidden">
          <div className={`${currentThemeConfig.text} w-full leading-relaxed`}>
            {isModelTyping ? (
              <TypingIndicator />
            ) : (
              <>
                {parsedParts.map(part => {
                  if (!part) return null;
                  if (part.type === 'code') {
                    return <CodeBlock key={part.key} language={part.language} code={part.content} theme={theme} />;
                  }
                  // For text parts, parse markdown and render as HTML
                  const html = marked.parse(part.content);
                  return (
                     <div
                        key={part.key}
                        className={`prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-sky-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-code:${currentThemeConfig.text} prose-code:${currentThemeConfig.userBg} prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-semibold prose-headings:${currentThemeConfig.text} prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:${currentThemeConfig.textSecondary} prose-table:border-collapse prose-table:border prose-table:${currentThemeConfig.aiBorder} prose-th:${currentThemeConfig.userBg} prose-th:font-semibold prose-td:border prose-td:${currentThemeConfig.aiBorder} prose-td:px-2 prose-td:py-1 selection:bg-purple-500/30`}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                  );
                })}
                {showStreamingCursor && <span className="inline-block w-1 h-5 ml-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full animate-pulse align-[-3px]"></span>}
              </>
            )}
            {!isModelTyping && <p className={`text-xs ${currentThemeConfig.textSecondary} mt-2 opacity-70`}>{timestamp}</p>}
          </div>
          
          {/* Enhanced action buttons */}
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${currentThemeConfig.userBg} ${currentThemeConfig.textSecondary} border ${currentThemeConfig.userBorder} rounded-full hover:opacity-80 transition-all duration-300 group`}>
                <WandIcon className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                Think Harder
                <XIcon className="h-3.5 w-3.5 text-zinc-500" />
              </button>
              
              <button className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-700/50 rounded-full hover:opacity-90 transition-all duration-300 group`}>
                <svg className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate
              </button>
              
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${currentThemeConfig.userBg} ${currentThemeConfig.textSecondary} border ${currentThemeConfig.userBorder} rounded-full hover:opacity-80 transition-all duration-300 group`}
              >
                {isCopied ? <CheckIcon className="h-3.5 w-3.5 text-green-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              
              <button
                onClick={handleShare}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${currentThemeConfig.userBg} ${currentThemeConfig.textSecondary} border ${currentThemeConfig.userBorder} rounded-full hover:opacity-80 transition-all duration-300 group`}
              >
                <ShareIcon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                Share
              </button>
              
              <div className="flex items-center gap-1 border-l border-zinc-700/50 pl-2 ml-1">
                <button
                  onClick={() => handleFeedback('up')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${feedback === 'up' ? 'bg-green-900/30 text-green-400' : `${currentThemeConfig.textSecondary} hover:${currentThemeConfig.text} hover:${currentThemeConfig.userBg}`}`}
                  aria-label="Good response"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${feedback === 'down' ? 'bg-red-900/30 text-red-400' : `${currentThemeConfig.textSecondary} hover:${currentThemeConfig.text} hover:${currentThemeConfig.userBg}`}`}
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
