import React, { useEffect, KeyboardEvent, forwardRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';

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
    <div className="w-full max-w-4xl mx-auto p-4">
      <div 
        className="
          relative flex items-end gap-2 p-3
          bg-zinc-50/80 dark:bg-zinc-900/50
          border border-zinc-200/60 dark:border-zinc-700/50
          rounded-2xl
          transition-all duration-300 ease-out
          focus-within:border-purple-500/60 dark:focus-within:border-purple-400/60 
          focus-within:ring-2 focus-within:ring-purple-500/20 dark:focus-within:ring-purple-400/20
          backdrop-blur-md shadow-sm hover:shadow-md
          before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/5 before:to-blue-500/5 before:opacity-0 before:transition-opacity before:hover:opacity-100
        "
      >
        <button
            aria-label="Attach file"
            title="Attach file (coming soon)"
            className="group p-3 text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-xl flex-shrink-0 cursor-not-allowed opacity-70 group-hover:opacity-100 relative overflow-hidden"
        >
            <div className="relative z-10">
              <PaperclipIcon className="h-5 w-5" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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
            w-full bg-transparent text-zinc-900 dark:text-zinc-100 resize-none 
            focus:outline-none 
            disabled:cursor-not-allowed
            placeholder-zinc-500 dark:placeholder-zinc-500 text-base
            py-3 px-3
            selection:bg-purple-200/50 dark:selection:bg-purple-900/50
          "
          disabled={isLoading}
          aria-label="Chat input"
        />

        <button
            aria-label="Use microphone"
            title="Use microphone (coming soon)"
            className="group p-3 text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-xl flex-shrink-0 cursor-not-allowed opacity-70 group-hover:opacity-100 relative overflow-hidden"
        >
            <div className="relative z-10">
              <MicIcon className="h-5 w-5" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>

        <button
          onClick={onSend}
          disabled={isDisabled}
          aria-label={isLoading ? "Sending..." : "Send message"}
          className={`
            relative overflow-hidden p-3 rounded-xl transition-all duration-300 ease-out flex-shrink-0 group
            ${isDisabled
              ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-70'
              : 'text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white before:to-transparent before:opacity-0 before:transition-opacity before:group-hover:opacity-20'
            }`}
        >
          <div className="relative z-10">
            <SendIcon className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300" />
          </div>
          {!isDisabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </button>
      </div>
    </div>
  );
});

ChatInputComponent.displayName = 'ChatInput';

export const ChatInput = React.memo(ChatInputComponent);
