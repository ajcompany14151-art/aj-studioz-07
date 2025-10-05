import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SaveChatModalProps {
  onSave: (name: string) => void;
  onDiscard: () => void;
  onClose: () => void;
}

export const SaveChatModal: React.FC<SaveChatModalProps> = ({ onSave, onDiscard, onClose }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field when the modal opens
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="save-chat-title">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in fade-in-0 zoom-in-95">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="save-chat-title" className="text-xl font-semibold text-zinc-900 dark:text-white">Save Conversation</h2>
            <button onClick={onClose} className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">Please name this conversation to save it before starting a new chat.</p>
          
          <div>
            <label htmlFor="chat-name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-300">CONVERSATION NAME</label>
            <input
              ref={inputRef}
              id="chat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Python Scraper Ideas"
              className="mt-1 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-600 transition-all"
            />
          </div>
        </div>
        
        <div className="bg-zinc-100/50 dark:bg-black/30 px-6 py-4 rounded-b-2xl flex justify-end items-center gap-3 border-t border-zinc-200 dark:border-zinc-800">
          <button onClick={onDiscard} className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-4 w-4" />
            Save & Start New
          </button>
        </div>
      </div>
    </div>
  );
};
