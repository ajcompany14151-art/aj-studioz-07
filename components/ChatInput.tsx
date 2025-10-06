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
          relative flex items-end gap-2 p-2
          bg-zinc-900/50 dark:bg-gradient-to-r dark:from-zinc-900 dark:to-black
          border border-zinc-700/50 dark:border-zinc-700
          rounded-2xl
          transition-all duration-200
          focus-within:border-purple-500/50 dark:focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 dark:focus-within:ring-purple-500/30
          backdrop-blur-sm
          shadow-sm hover:shadow-md transition-shadow
        "
      >
        <button
            aria-label="Attach file"
            title="Attach file (coming soon)"
            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors rounded-xl flex-shrink-0 cursor-not-allowed opacity-50 group"
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
          placeholder="How can I help?"
          className="
            w-full bg-transparent text-white resize-none 
            focus:outline-none 
            disabled:cursor-not-allowed
            placeholder-zinc-500 dark:placeholder-zinc-400 text-base
            py-2.5 px-2
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
            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors rounded-xl flex-shrink-0 cursor-not-allowed opacity-50 group"
            onTouchStart={(e) => e.preventDefault()}
        >
            <MicIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={onSend}
          disabled={isDisabled}
          aria-label={isLoading ? "Sending..." : "Send message"}
          className={`
            p-2 rounded-xl transition-all duration-200 transform flex-shrink-0
            ${isDisabled
              ? 'text-zinc-600 dark:text-zinc-500 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30 group'
            } ${!isDisabled && 'group-hover:shadow-xl group-hover:shadow-purple-500/40'}
          `}
          onTouchStart={(e) => !isDisabled && e.preventDefault()} // Mobile haptic feedback prep
        >
          <SendIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = React.memo(ChatInputComponent);
