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
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-white',
    placeholder: 'placeholder-zinc-500',
    focusBorder: 'focus:border-zinc-700',
    gradient: 'from-purple-600 to-blue-600'
  },
  light: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    placeholder: 'placeholder-gray-500',
    focusBorder: 'focus:border-gray-300',
    gradient: 'from-purple-600 to-blue-600'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    placeholder: 'placeholder-slate-400',
    focusBorder: 'focus:border-slate-700',
    gradient: 'from-indigo-600 to-cyan-600'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    border: 'border-gray-800',
    text: 'text-white',
    placeholder: 'placeholder-gray-400',
    focusBorder: 'focus:border-gray-700',
    gradient: 'from-green-600 to-emerald-600'
  }
};

const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ value, onChange, onSend, isLoading, theme }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDisabled = isLoading || !value.trim();
  const maxChars = 5000;
  const inputContainerRef = useRef<HTMLDivElement>(null);
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    });
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) {
        onSend();
      }
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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div 
        ref={inputContainerRef}
        className={`
          relative mx-auto transition-all duration-200 ease-out
          ${isMobile ? 'max-w-full' : 'max-w-3xl mr-8'}
          ${isFocused ? 'scale-[1.01]' : 'scale-100'}
        `}
      >
        {/* Grok-inspired compact input container */}
        <div 
          className={`
            relative flex items-center gap-2 px-3 py-2
            ${currentThemeConfig.bg} 
            border ${currentThemeConfig.border}
            rounded-full
            shadow-sm
            transition-all duration-200
            ${isFocused 
              ? `${currentThemeConfig.focusBorder} shadow-md` 
              : ''
            }
          `}
        >
          {/* AJ Studioz branding icon in place of attachment */}
          <button
              aria-label="Attach file"
              title="Attach file (coming soon)"
              className={`p-1.5 ${currentThemeConfig.text === 'text-white' ? 'text-zinc-500' : 'text-gray-500'} hover:text-white/90 transition-all duration-200 rounded-full flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100`}
              onTouchStart={(e) => e.preventDefault()}
          >
              <PaperclipIcon className="h-4 w-4" />
          </button>

          <div className="relative flex-1 min-w-0">
            <textarea
              ref={ref}
              id="chat-input"
              value={value}
              onChange={(e) => onChange(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything..."
              className={`
                flex-1 bg-transparent ${currentThemeConfig.text} resize-none 
                focus:outline-none focus:placeholder-transparent
                disabled:cursor-not-allowed
                ${currentThemeConfig.placeholder} text-sm leading-relaxed
                py-2 px-2
                min-h-[20px]
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
            />
            
            {/* Character count indicator - only show when approaching limit */}
            {charCount > maxChars * 0.8 && (
              <div className={`absolute bottom-2 right-2 text-xs transition-all duration-300 ${
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
              className={`p-1.5 ${currentThemeConfig.text === 'text-white' ? 'text-zinc-500' : 'text-gray-500'} hover:text-white/90 transition-all duration-200 rounded-full flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100`}
              onTouchStart={(e) => e.preventDefault()}
          >
              <MicIcon className="h-4 w-4" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
          </button>

          {/* Enhanced send button with Grok sparkle */}
          <button
            onClick={onSend}
            disabled={isDisabled}
            aria-label={isLoading ? "Sending..." : "Send to AJ Studioz"}
            className={`
              p-1.5 rounded-full transition-all duration-200 transform flex-shrink-0
              ${isDisabled
                ? 'text-zinc-600 cursor-not-allowed opacity-50'
                : `bg-gradient-to-r ${currentThemeConfig.gradient} text-white hover:scale-105 active:scale-95`
              }
            `}
            onTouchStart={(e) => !isDisabled && e.preventDefault()}
          >
            <div className="relative z-10">
              {isLoading ? (
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 relative z-10" />
                  <SparklesIcon className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

ChatInputComponent.displayName = 'ChatInput';

const ChatInput = React.memo(ChatInputComponent);

export { ChatInput };
