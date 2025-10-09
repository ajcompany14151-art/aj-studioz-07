// components/ChatMessage.tsx
import React, { useMemo, useState, useRef } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { CodeBlock } from './CodeBlock';
import { WandIcon } from './icons/WandIcon';
import { XIcon } from './icons/XIcon';
import TypingIndicator from './TypingIndicator';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

// Enhanced theme configs with corporate gradients
const themeConfigs = {
  dark: {
    userBg: 'bg-zinc-800',
    userBorder: 'border-zinc-700',
    aiBg: 'bg-zinc-900/80 backdrop-blur-xl',
    aiBorder: 'border-zinc-800/50',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    codeTheme: 'atom-one-dark',
    gradient: 'from-purple-600 to-blue-600'
  },
  light: {
    userBg: 'bg-gray-100',
    userBorder: 'border-gray-200',
    aiBg: 'bg-white',
    aiBorder: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    codeTheme: 'atom-one-light',
    gradient: 'from-purple-600 to-blue-600'
  },
  'z-ai': {
    userBg: 'bg-slate-800',
    userBorder: 'border-slate-700',
    aiBg: 'bg-slate-900/80 backdrop-blur-xl',
    aiBorder: 'border-slate-800/50',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    codeTheme: 'vs2015',
    gradient: 'from-indigo-600 to-cyan-600'
  },
  'chatgpt': {
    userBg: 'bg-gray-800',
    userBorder: 'border-gray-700',
    aiBg: 'bg-gray-900/80 backdrop-blur-xl',
    aiBorder: 'border-gray-800/50',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    codeTheme: 'github-dark',
    gradient: 'from-green-600 to-emerald-600'
  }
};

// Enhanced parseContent with image support
const parseContent = (content: string) => {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const codeRegex = /```([\w]+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const parts: any[] = [];

  // Handle images
  let imageMatch;
  while ((imageMatch = imageRegex.exec(content)) !== null) {
    if (lastIndex !== imageMatch.index) {
      parts.push({ type: 'text', content: content.slice(lastIndex, imageMatch.index), key: `text-${parts.length}` });
    }
    parts.push({ type: 'image', alt: imageMatch[1], src: imageMatch[2], key: `img-${parts.length}` });
    lastIndex = imageMatch.index + imageMatch[0].length;
  }

  // Handle code blocks
  let codeMatch;
  while ((codeMatch = codeRegex.exec(content)) !== null) {
    if (lastIndex !== codeMatch.index) {
      parts.push({ type: 'text', content: content.slice(lastIndex, codeMatch.index), key: `text-${parts.length}` });
    }
    const language = codeMatch[1] || 'plaintext';
    const code = codeMatch[2].trim();
    parts.push({ type: 'code', language, content: code, key: `code-${parts.length}` });
    lastIndex = codeMatch.index + codeMatch[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex), key: `text-${parts.length}` });
  }

  return parts.filter(part => part.content?.trim() || part.type === 'image');
};

declare var marked: any;

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
  onRegenerate?: () => void;
  onThinkHarder?: () => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ 
  message, 
  isLoading, 
  isLastMessage, 
  theme = 'dark',
  onRegenerate,
  onThinkHarder 
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isUser = message.role === MessageRole.USER;
  const isModelTyping = message.role === MessageRole.MODEL && message.content === '';
  const showStreamingCursor = isLastMessage && isLoading && message.role === MessageRole.MODEL && message.content !== '';
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  const parsedParts = useMemo(() => {
    return !isModelTyping ? parseContent(message.content) : [];
  }, [message.content, isModelTyping]);

  const timestamp = new Date(message.timestamp || Date.now()).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AJ Studioz Conversation',
        text: message.content,
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aj-studioz-${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Send to backend in production
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (isUser) {
    return (
      <div className="py-4 px-2 animate-in slide-in-from-right-2 duration-500">
        <div className="flex items-start gap-4 max-w-4xl ml-auto">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg mt-1">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-grow min-w-0">
            <div className={`p-4 rounded-2xl ${currentThemeConfig.userBg} border ${currentThemeConfig.userBorder} shadow-md max-w-full`}>
              <p className={`${currentThemeConfig.text} whitespace-pre-wrap break-words text-sm leading-relaxed`}>
                {message.content}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs ${currentThemeConfig.textSecondary} opacity-70`}>{timestamp}</p>
              <div className="flex gap-2">
                <button onClick={handleCopy} className={`p-1.5 rounded-lg ${currentThemeConfig.textSecondary} hover:bg-gray-800/50 transition-all`}>
                  <CopyIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-4 px-2 animate-in slide-in-from-left-2 duration-500 ${showStreamingCursor ? 'pr-4' : ''}`}>
      <div className="flex items-start gap-4 max-w-4xl">
        <div className="relative flex-shrink-0 mt-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-xl animate-pulse opacity-20"></div>
          <div className={`relative w-10 h-10 ${theme === 'light' ? 'bg-white' : 'bg-black'} rounded-full border-2 ${currentThemeConfig.aiBorder} flex items-center justify-center overflow-hidden`}>
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz" 
              className="h-6 w-6 rounded-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
        <div className="flex-grow w-full overflow-hidden">
          <div className={`${currentThemeConfig.text} w-full leading-relaxed`}>
            {isModelTyping ? (
              <TypingIndicator />
            ) : (
              <div className={`p-4 rounded-2xl ${currentThemeConfig.aiBg} border ${currentThemeConfig.aiBorder} shadow-lg ${isExpanded ? 'max-w-full' : 'max-w-3xl'}`}>
                {parsedParts.map((part, index) => {
                  if (part.type === 'code') {
                    return <CodeBlock key={part.key} language={part.language} code={part.content} theme={theme} />;
                  }
                  if (part.type === 'image') {
                    return (
                      <div key={part.key} className="my-4">
                        <img 
                          src={part.src} 
                          alt={part.alt} 
                          className="max-w-full h-auto rounded-xl shadow-lg border ${currentThemeConfig.aiBorder}" 
                        />
                        <p className={`text-xs ${currentThemeConfig.textSecondary} mt-1`}>{part.alt}</p>
                      </div>
                    );
                  }
                  const html = marked.parse(part.content);
                  return (
                    <div
                      key={part.key || index}
                      className={`prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-a:text-purple-400 hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-code:${currentThemeConfig.text} prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-headings:${currentThemeConfig.text} prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:${currentThemeConfig.textSecondary} prose-table:border-collapse prose-table:border prose-table:${currentThemeConfig.aiBorder} prose-th:${currentThemeConfig.userBg} prose-th:font-semibold prose-td:border prose-td:${currentThemeConfig.aiBorder} prose-td:px-2 prose-td:py-1 selection:bg-purple-500/30 ${!isExpanded ? 'line-clamp-6' : ''}`}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                })}
                {showStreamingCursor && <span className="inline-block w-1 h-5 ml-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full animate-pulse align-middle"></span>}
              </div>
            )}
            {!isModelTyping && (
              <div className="flex justify-between items-center mt-3">
                <p className={`text-xs ${currentThemeConfig.textSecondary} opacity-70`}>{timestamp}</p>
                <button 
                  onClick={toggleExpand}
                  className={`text-xs ${currentThemeConfig.textSecondary} hover:${currentThemeConfig.accent} flex items-center gap-1 transition-all`}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                  <ChevronDownIcon className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
          
          {/* Enhanced action bar with corporate style */}
          {!isLoading && !isModelTyping && message.content.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 p-2 bg-zinc-900/30 rounded-xl backdrop-blur-sm border ${currentThemeConfig.aiBorder}">
              <button 
                onClick={onThinkHarder}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${currentThemeConfig.textSecondary} hover:bg-purple-500/20 hover:${currentThemeConfig.accent} transition-all duration-300`}
              >
                <WandIcon className="h-3.5 w-3.5 rotate-0 hover:rotate-12 transition-transform" />
                Think Deeper
              </button>
              
              <button 
                onClick={onRegenerate}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r ${currentThemeConfig.gradient} text-white rounded-full hover:opacity-90 transition-all duration-300`}
              >
                <svg className="h-3.5 w-3.5 rotate-0 hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
              
              <button onClick={handleCopy} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${currentThemeConfig.textSecondary} hover:bg-gray-800/50 transition-all`}>
                {isCopied ? <CheckIcon className="h-3.5 w-3.5 text-green-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              
              <button onClick={handleShare} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${currentThemeConfig.textSecondary} hover:bg-gray-800/50 transition-all`}>
                <ShareIcon className="h-3.5 w-3.5" />
                Share
              </button>

              <button onClick={handleDownload} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${currentThemeConfig.textSecondary} hover:bg-gray-800/50 transition-all`}>
                <DownloadIcon className="h-3.5 w-3.5" />
                Export
              </button>
              
              <div className="flex items-center gap-1 ml-auto pl-2 border-l ${currentThemeConfig.aiBorder}/50">
                <button
                  onClick={() => handleFeedback('up')}
                  className={`p-1.5 rounded-lg transition-all ${feedback === 'up' ? 'bg-green-900/30 text-green-400' : `${currentThemeConfig.textSecondary} hover:bg-green-900/20 hover:text-green-400`}`}
                  aria-label="Thumbs up"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className={`p-1.5 rounded-lg transition-all ${feedback === 'down' ? 'bg-red-900/30 text-red-400' : `${currentThemeConfig.textSecondary} hover:bg-red-900/20 hover:text-red-400`}`}
                  aria-label="Thumbs down"
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
