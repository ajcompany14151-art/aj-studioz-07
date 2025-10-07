// components/ChatInput.tsx
import React, { useEffect, KeyboardEvent, forwardRef, useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';

// Simple ShareIcon component
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
  </svg>
);

// AJ Studioz-inspired logo icon (simple SVG for creative design branding - pencil and palette)
const AJIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ value, onChange, onSend, isLoading }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isDisabled = isLoading || !value.trim();
  const maxChars = 5000;
  const inputContainerRef = useRef<HTMLDivElement>(null);

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
      // Responsive max height
      const maxHeight = isExpanded ? (isMobile ? 200 : 300) : (isMobile ? 120 : 200);
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
        setShowSuggestions(true);
        // Only apply zoom fix on iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          document.body.style.zoom = '0.99';
        }
      };
      const handleBlur = () => {
        setIsFocused(false);
        // Only hide suggestions if input is empty
        if (value.length === 0) {
          setShowSuggestions(false);
        }
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
  }, [ref, value]);

  // Handle clicks outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        if (value.length === 0) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);

  // Grok-like AJ Studioz suggestions: Witty, creative, with a dash of xAI curiosity
  const suggestions = [
    { text: "Design a logo for a sustainable fashion brand", icon: "🎨" },
    { text: "Storyboard a 30-second promo video for a tech gadget", icon: "📹" },
    { text: "Create a color palette and typography guide for a coffee shop", icon: "☕" },
    { text: "Brainstorm 5 poster concepts for a music festival", icon: "🎶" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div 
        ref={inputContainerRef}
        className={`
          relative mx-auto max-w-4xl pointer-events-auto transition-all duration-300 ease-out
          ${isFocused ? 'scale-[1.02]' : 'scale-100'}
        `}
        style={{
          marginBottom: isMobile ? `${keyboardHeight}px` : '0',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : '0'
        }}
      >
        {/* Glassmorphism floating input container with Grok-inspired AJ flair */}
        <div 
          className={`
            relative flex items-end gap-2 p-4
            bg-black/40 backdrop-blur-xl
            border border-white/10
            rounded-3xl
            shadow-2xl
            transition-all duration-300
            ${isFocused 
              ? 'bg-black/60 border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
              : 'hover:bg-black/50 hover:border-white/15 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'
            }
            ${isExpanded ? 'rounded-t-3xl' : 'rounded-3xl'}
          `}
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300" 
               style={{
                 background: isFocused 
                   ? 'linear-gradient(90deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.3) 50%, rgba(139,92,246,0.3) 100%)' 
                   : 'linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(139,92,246,0.1) 100%)',
                 filter: 'blur(1px)',
                 zIndex: -1,
               }}
          />
          
          {/* AJ Studioz branding icon in place of attachment */}
          <button
              aria-label="Attach file"
              title="Attach file (coming soon)"
              className="p-2.5 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden"
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              <PaperclipIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          </button>

          <div className="relative flex-1 min-w-0">
            <textarea
              ref={ref}
              id="chat-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Design your vision with AJ Studioz..."
              className={`
                flex-1 bg-transparent text-white resize-none 
                focus:outline-none focus:placeholder-transparent
                disabled:cursor-not-allowed
                placeholder-zinc-400 text-base leading-relaxed
                py-2.5 px-4
                min-h-[24px]
                ${isFocused ? 'text-white' : 'text-zinc-100'}
                ${isMobile ? 'text-lg' : ''}
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
              className="p-2.5 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden"
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              <MicIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
          </button>

          {/* Enhanced send button with Grok sparkle */}
          <button
            onClick={onSend}
            disabled={isDisabled}
            aria-label={isLoading ? "Sending..." : "Send to AJ Studioz"}
            className={`
              p-2.5 rounded-2xl transition-all duration-300 transform flex-shrink-0 relative overflow-hidden group
              ${isDisabled
                ? 'text-zinc-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 hover:scale-110 active:scale-95 shadow-lg'
              }
            `}
            onTouchStart={(e) => !isDisabled && e.preventDefault()}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
            
            {/* Enhanced icon with rotation effect */}
            <div className="relative z-10">
              {isLoading ? (
                <div className="h-5 w-5 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <SendIcon className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <SparklesIcon className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </>
              )}
            </div>
          </button>
        </div>
        
        {/* Floating suggestions with Grok-AJ theme: Witty header, smooth hovers */}
        {showSuggestions && !isMobile && value.length === 0 && !isLoading && (
          <div className="absolute bottom-full left-0 right-0 mb-3 p-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="mx-auto max-w-4xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center gap-2 mb-2">
              <AJIcon className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-zinc-400">Spark your creativity with AJ Studioz:</span>
            </div>
            <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(suggestion.text);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-black/40 hover:bg-black/60 transition-all duration-200 text-left group border border-white/5 hover:shadow-md hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-xs text-zinc-300 group-hover:text-white truncate">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Expand button */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 text-zinc-400 hover:text-white transition-all duration-200"
            aria-label="Expand input"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        
        {/* Collapse button */}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 text-zinc-400 hover:text-white transition-all duration-200"
            aria-label="Collapse input"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

const ChatInput = React.memo(ChatInputComponent);

export { ChatInput };
