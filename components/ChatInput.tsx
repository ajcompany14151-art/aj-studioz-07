// components/ChatInput.tsx
import React, { useEffect, KeyboardEvent, forwardRef, useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  theme: string;
}

// Theme configurations
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-900/80',
    border: 'border-zinc-800/50',
    text: 'text-white',
    placeholder: 'placeholder-zinc-500',
    hover: 'hover:bg-zinc-900/85',
    focus: 'focus:bg-zinc-900/90',
    gradient: 'from-purple-600 to-blue-600'
  },
  light: {
    bg: 'bg-white/80',
    border: 'border-gray-200/50',
    text: 'text-gray-900',
    placeholder: 'placeholder-gray-500',
    hover: 'hover:bg-white/85',
    focus: 'focus:bg-white/90',
    gradient: 'from-purple-600 to-blue-600'
  },
  'z-ai': {
    bg: 'bg-slate-800/80',
    border: 'border-slate-700/50',
    text: 'text-white',
    placeholder: 'placeholder-slate-400',
    hover: 'hover:bg-slate-800/85',
    focus: 'focus:bg-slate-800/90',
    gradient: 'from-indigo-600 to-cyan-600'
  },
  'chatgpt': {
    bg: 'bg-gray-800/80',
    border: 'border-gray-700/50',
    text: 'text-white',
    placeholder: 'placeholder-gray-400',
    hover: 'hover:bg-gray-800/85',
    focus: 'focus:bg-gray-800/90',
    gradient: 'from-green-600 to-emerald-600'
  }
};

const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ value, onChange, onSend, isLoading, theme }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isDisabled = isLoading || !value.trim();
  const maxChars = 5000;
  const inputContainerRef = useRef<HTMLDivElement>(null);
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced keyboard height detection for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleVisualViewportChange = () => {
      const viewport = (window as any).visualViewport;
      if (viewport) {
        const heightDiff = window.innerHeight - viewport.height;
        setKeyboardHeight(heightDiff > 150 ? heightDiff : 0);
      }
    };
    
    const viewport = (window as any).visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', handleVisualViewportChange);
      return () => viewport.removeEventListener('resize', handleVisualViewportChange);
    }
  }, [isMobile]);

  useEffect(() => {
    setCharCount(value.length);
    const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Responsive max height - shorter for Grok-like design
      const maxHeight = isExpanded ? (isMobile ? 150 : 200) : (isMobile ? 80 : 120);
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value, ref, isMobile, isExpanded]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) {
        onSend();
      }
    }
    
    // Expand on shift+enter
    if (event.key === 'Enter' && event.shiftKey) {
      setIsExpanded(true);
    }
  };

  // Mobile enhancement: Prevent zoom on focus
  useEffect(() => {
    const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
    if (textarea) {
      const handleFocus = () => {
        setIsFocused(true);
        // Only apply zoom fix on iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          document.body.style.zoom = '0.99';
        }
      };
      const handleBlur = () => {
        setIsFocused(false);
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          document.body.style.zoom = '';
        }
      };
      
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
      
      return () => {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      };
    }
  }, [ref]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div 
        ref={inputContainerRef}
        className={`
          relative mx-auto max-w-4xl pointer-events-auto transition-all duration-300 ease-out
          ${isFocused ? 'scale-[1.01]' : 'scale-100'}
        `}
        style={{
          marginBottom: isMobile ? `${keyboardHeight}px` : '0',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : '0'
        }}
      >
        {/* Grok-inspired compact input container */}
        <div 
          className={`
            relative flex items-center gap-2 p-3
            ${currentThemeConfig.bg} backdrop-blur-xl
            border ${currentThemeConfig.border}
            rounded-xl
            shadow-lg
            transition-all duration-300
            ${isFocused 
              ? `${currentThemeConfig.focus} ${currentThemeConfig.border.replace('border-', 'border-')} shadow-[0_0_20px_rgba(139,92,246,0.2)]` 
              : currentThemeConfig.hover
            }
          `}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300" 
               style={{
                 background: isFocused 
                   ? 'linear-gradient(90deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 50%, rgba(139,92,246,0.2) 100%)' 
                   : 'linear-gradient(90deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(139,92,246,0.05) 100%)',
                 filter: 'blur(1px)',
                 zIndex: -1,
               }}
          />
          
          {/* AJ Studioz branding icon in place of attachment */}
          <button
              aria-label="Attach file"
              title="Attach file (coming soon)"
              className={`p-2 ${currentThemeConfig.text === 'text-white' ? 'text-zinc-500' : 'text-gray-500'} hover:text-white/90 transition-all duration-300 rounded-lg flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden`}
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
              <PaperclipIcon className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          </button>

          <div className="relative flex-1 min-w-0">
            <textarea
              ref={ref}
              id="chat-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything..."
              className={`
                flex-1 bg-transparent ${currentThemeConfig.text} resize-none 
                focus:outline-none focus:placeholder-transparent
                disabled:cursor-not-allowed
                ${currentThemeConfig.placeholder} text-base leading-relaxed
                py-2 px-3
                min-h-[20px]
                ${isFocused ? currentThemeConfig.text : currentThemeConfig.text}
                ${isMobile ? 'text-base' : ''}
              `}
              disabled={isLoading}
              aria-label="Chat input"
              maxLength={maxChars}
              spellCheck={true}
              autoCapitalize="sentences"
              autoCorrect="on"
              style={{ fontSize: isMobile ? '16px' : 'inherit' }} // Prevent zoom on iOS
            />
            
            {/* Character count indicator - only show when approaching limit */}
            {charCount > maxChars * 0.8 && (
              <div className={`absolute bottom-1 right-1 text-xs transition-all duration-300 ${
                charCount > maxChars * 0.9 ? 'text-red-400' : 'text-zinc-500'
              }`}>
                {charCount}/{maxChars}
              </div>
            )}
          </div>

          {/* Enhanced microphone button with voice mode hint */}
          <button
              aria-label="Use voice mode"
              title="Voice mode (coming soon—whisper your ideas!)"
              className={`p-2 ${currentThemeConfig.text === 'text-white' ? 'text-zinc-500' : 'text-gray-500'} hover:text-white/90 transition-all duration-300 rounded-lg flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden`}
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
              <MicIcon className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
          </button>

          {/* Enhanced send button with Grok sparkle */}
          <button
            onClick={onSend}
            disabled={isDisabled}
            aria-label={isLoading ? "Sending..." : "Send to AJ Studioz"}
            className={`
              p-2 rounded-lg transition-all duration-300 transform flex-shrink-0 relative overflow-hidden group
              ${isDisabled
                ? 'text-zinc-600 cursor-not-allowed opacity-50'
                : `bg-gradient-to-r ${currentThemeConfig.gradient} text-white hover:scale-105 active:scale-95`
              }
            `}
            onTouchStart={(e) => !isDisabled && e.preventDefault()}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
            
            {/* Enhanced icon with rotation effect */}
            <div className="relative z-10">
              {isLoading ? (
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <SparklesIcon className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

const ChatInput = React.memo(ChatInputComponent);

export { ChatInput };
