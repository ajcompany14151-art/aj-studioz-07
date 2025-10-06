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
          bg-black/80 backdrop-blur-xl
          border border-zinc-700/50
          rounded-3xl
          transition-all duration-300
          focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/30
          shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-purple-500/20
          z-50
          animate-subtle-glow
        "
        style={{
          // Subtle glow animation via CSS-in-JS for premium feel
          animation: 'subtle-glow 3s ease-in-out infinite alternate',
        }}
      >
        {/* Custom glow animation - add to global CSS or inline */}
        <style jsx>{`
          @keyframes subtle-glow {
            0% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
            100% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.1); }
          }
          .animate-subtle-glow:hover {
            animation-duration: 2s;
          }
        `}</style>
        <button
            aria-label="Attach file"
            title="Attach file (coming soon)"
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-2xl flex-shrink-0 cursor-not-allowed opacity-50 group"
            onTouchStart={(e) => e.preventDefault()} // Mobile: Prevent double-tap zoom
        >
            <PaperclipIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        <textarea
          ref={ref}
          id="chat-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="
            w-full bg-transparent text-white resize-none 
            focus:outline-none 
            disabled:cursor-not-allowed
            placeholder-zinc-500 text-base
            py-3 px-3
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
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-2xl flex-shrink-0 cursor-not-allowed opacity-50 group"
            onTouchStart={(e) => e.preventDefault()}
        >
            <MicIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={onSend}
          disabled={isDisabled}
          aria-label={isLoading ? "Sending..." : "Send message"}
          className={`
            p-2 rounded-2xl transition-all duration-300 transform flex-shrink-0 relative overflow-hidden
            ${isDisabled
              ? 'text-zinc-600 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30 group'
            } ${!isDisabled && 'group-hover:shadow-xl group-hover:shadow-purple-500/40 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 before:transition-opacity before:group-hover:opacity-100'}
          `}
          onTouchStart={(e) => !isDisabled && e.preventDefault()} // Mobile haptic feedback prep
        >
          <SendIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200 relative z-10" />
        </button>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = React.memo(ChatInputComponent);
