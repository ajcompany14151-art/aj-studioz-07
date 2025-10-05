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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-black">
      <div 
        className="
          relative flex items-end gap-2 p-2
          bg-zinc-100 dark:bg-[#131313]
          border border-zinc-300 dark:border-zinc-800/80
          rounded-2xl
          transition-all duration-200
          focus-within:border-zinc-500 dark:focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-500/50 dark:focus-within:ring-zinc-700/50
        "
      >
        <button
            aria-label="Attach file"
            title="Attach file (coming soon)"
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl flex-shrink-0 cursor-not-allowed opacity-50"
        >
            <PaperclipIcon className="h-5 w-5" />
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
            w-full bg-transparent text-zinc-900 dark:text-white resize-none 
            focus:outline-none 
            disabled:cursor-not-allowed
            placeholder-zinc-500 text-base
            py-2.5 px-2
          "
          disabled={isLoading}
          aria-label="Chat input"
        />

        <button
            aria-label="Use microphone"
            title="Use microphone (coming soon)"
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl flex-shrink-0 cursor-not-allowed opacity-50"
        >
            <MicIcon className="h-5 w-5" />
        </button>

        <button
          onClick={onSend}
          disabled={isDisabled}
          aria-label={isLoading ? "Sending..." : "Send message"}
          className={`
            p-2 rounded-xl transition-all duration-200 transform flex-shrink-0
            ${isDisabled
              ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95'
            }`
          }
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = React.memo(ChatInputComponent);