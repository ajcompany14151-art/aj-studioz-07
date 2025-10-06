// components/ChatInput.tsx
import React, { useEffect, KeyboardEvent, forwardRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ value, onChange, onSend, isLoading }, ref) => {
  const isDisabled = isLoading || !value.trim();

  useEffect(() => {
    const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // max height of 200px
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
      textarea.addEventListener('focus', () => {
        document.body.style.zoom = '0.99'; // Anti-zoom hack for iOS
      });
      textarea.addEventListener('blur', () => {
        document.body.style.zoom = '';
      });
    }
  }, [ref]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div 
        className="
          relative flex items-end gap-2 p-3
          bg-black/90 backdrop-blur-2xl
          border border-zinc-700/30
          rounded-3xl
          transition-all duration-500
          focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-400/30
          shadow-2xl shadow-black/60 hover:shadow-3xl hover:shadow-purple-500/20
          z-50
          translate-y-0 hover:-translate-y-0.5
          animate-float-glow
        "
        style={{
          // Exact Grok-like floating glow: subtle, infinite pulse with lift
          animation: 'float-glow 4s ease-in-out infinite alternate',
          transform: 'translateY(0px)',
        }}
      >
        {/* Custom floating glow animation - scoped like Grok's ethereal input */}
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
        <button
            aria-label="Attach file"
            title="Attach file (coming soon)"
            className="p-2 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100"
            onTouchStart={(e) => e.preventDefault()} // Mobile: Prevent double-tap zoom
        >
            <PaperclipIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        </button>

        <textarea
          ref={ref}
          id="chat-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask me anything..."
          className="
            flex-1 bg-transparent text-white resize-none 
            focus:outline-none focus:placeholder-transparent
            disabled:cursor-not-allowed
            placeholder-zinc-500 text-base leading-relaxed
            py-3 px-4
            min-h-[20px]
          "
          disabled={isLoading}
          aria-label="Chat input"
          maxLength={5000} // Enhancement: Limit input length
          spellCheck={true}
          autoCapitalize="sentences"
          autoCorrect="on"
        />

        <button
            aria-label="Use microphone"
            title="Use microphone (coming soon)"
            className="p-2 text-zinc-400 hover:text-white/90 transition-all duration-300 rounded-2xl flex-shrink-0 cursor-not-allowed opacity-60 group hover:opacity-100"
            onTouchStart={(e) => e.preventDefault()}
        >
            <MicIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        </button>

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
            ${!isDisabled && 'before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:transition-opacity before:group-hover:opacity-100 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:opacity-0 after:transition-opacity after:group-hover:opacity-100'}
          `}
          onTouchStart={(e) => !isDisabled && e.preventDefault()} // Mobile haptic feedback prep
        >
          <SendIcon className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = React.memo(ChatInputComponent);
