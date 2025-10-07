// components/ChatInput.tsx
import React, { useEffect, KeyboardEvent, forwardRef, useState } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';

// Simple ShareIcon component to replace the missing import
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
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
  const isDisabled = isLoading || !value.trim();
  const maxChars = 5000;

  useEffect(() => {
    setCharCount(value.length);
    const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = window.innerWidth < 768 ? 150 : 200; // Responsive max height
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value, ref]);

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
        document.body.style.zoom = '0.99'; // Anti-zoom hack for iOS
        setIsFocused(true);
      };
      const handleBlur = () => {
        document.body.style.zoom = '';
        setIsFocused(false);
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
    <div className="w-full max-w-4xl mx-auto p-4 relative">
      {/* Character count indicator */}
      <div className={`absolute right-6 bottom-6 text-xs transition-all duration-300 ${
        charCount > maxChars * 0.9 ? 'text-red-400' : 'text-zinc-500'
      } ${isFocused ? 'opacity-100' : 'opacity-0'}`}>
        {charCount}/{maxChars}
      </div>
      
      <div 
        className={`
          relative flex items-end gap-2 p-3
          bg-black/90 backdrop-blur-2xl
          border border-zinc-700/30
          rounded-3xl
          transition-all duration-500
          focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-400/30
          shadow-2xl shadow-black/60
          z-50
          ${isFocused ? 'shadow-3xl shadow-purple-500/20 -translate-y-1' : 'hover:shadow-3xl hover:shadow-purple-500/10 hover:-translate-y-0.5'}
          animate-float-glow
        `}
      >
        {/* Enhanced floating glow animation */}
        <style jsx>{`
          @keyframes float-glow {
            0% { 
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.05); 
              transform: translateY(0px);
            }
            100% { 
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1); 
              transform: translateY(-2px);
            }
          }
          .animate-float-glow:hover {
            animation-duration: 2.5s;
          }
          .animate-float-glow:focus-within {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Enhanced attachment button with ripple effect */}
        <div className="relative">
          <button
              aria-label="Attach file"
              title="Attach file (coming soon)"
              className="p-2 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden"
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              <PaperclipIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        <div className="relative flex-1">
          <textarea
            ref={ref}
            id="chat-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask me anything..."
            className={`
              flex-1 bg-transparent text-white resize-none 
              focus:outline-none focus:placeholder-transparent
              disabled:cursor-not-allowed
              placeholder-zinc-500 text-base leading-relaxed
              py-3 px-4
              min-h-[20px]
              ${isFocused ? 'text-white' : 'text-zinc-100'}
            `}
            disabled={isLoading}
            aria-label="Chat input"
            maxLength={maxChars}
            spellCheck={true}
            autoCapitalize="sentences"
            autoCorrect="on"
          />
          
          {/* Enhanced focus indicator */}
          {isFocused && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse w-full"></div>
          )}
        </div>

        {/* Enhanced microphone button with pulse effect */}
        <div className="relative">
          <button
              aria-label="Use microphone"
              title="Use microphone (coming soon)"
              className="p-2 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100 relative overflow-hidden"
              onTouchStart={(e) => e.preventDefault()}
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              <MicIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
          </button>
        </div>

        {/* Enhanced send button with ripple effect */}
        <div className="relative">
          <button
            onClick={onSend}
            disabled={isDisabled}
            aria-label={isLoading ? "Sending..." : "Send message"}
            className={`
              p-3 rounded-2xl transition-all duration-500 transform flex-shrink-0 relative overflow-hidden group
              ${isDisabled
                ? 'text-zinc-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/40'
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
      </div>
      
      {/* Enhanced suggestion pills */}
      {value.length === 0 && !isLoading && (
        <div className="flex flex-wrap gap-2 mt-3 px-2">
          {["Summarize", "Explain", "Code", "Write"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onChange(suggestion)}
              className="px-3 py-1 text-xs bg-zinc-800/50 text-zinc-300 rounded-full hover:bg-zinc-700/50 hover:text-white transition-all duration-300 border border-zinc-700/30"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

const ChatInput = React.memo(ChatInputComponent);

export { ChatInput };
