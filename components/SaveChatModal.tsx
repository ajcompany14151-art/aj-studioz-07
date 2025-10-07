// components/SaveChatModal.tsx
import React, { useState, useRef, KeyboardEvent } from 'react';
import { XIcon } from './icons/XIcon';

// Theme configurations
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-900/90',
    border: 'border-zinc-800/50',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    input: 'bg-zinc-800/50',
    button: 'bg-gradient-to-r from-purple-600 to-blue-600',
    buttonHover: 'hover:from-purple-700 hover:to-blue-700'
  },
  light: {
    bg: 'bg-white/90',
    border: 'border-gray-200/50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    input: 'bg-gray-100/50',
    button: 'bg-gradient-to-r from-purple-600 to-blue-600',
    buttonHover: 'hover:from-purple-700 hover:to-blue-700'
  },
  'z-ai': {
    bg: 'bg-slate-900/90',
    border: 'border-slate-700/50',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-800/50',
    button: 'bg-gradient-to-r from-indigo-600 to-cyan-600',
    buttonHover: 'hover:from-indigo-700 hover:to-cyan-700'
  },
  'chatgpt': {
    bg: 'bg-gray-900/90',
    border: 'border-gray-700/50',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-800/50',
    button: 'bg-gradient-to-r from-green-600 to-emerald-600',
    buttonHover: 'hover:from-green-700 hover:to-emerald-700'
  }
};

interface SaveChatModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  onDiscard: () => void;
  theme?: string;
}

const SaveChatModal: React.FC<SaveChatModalProps> = ({ onClose, onSave, onDiscard, theme = 'dark' }) => {
  const [chatName, setChatName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

  // Focus input when modal opens
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    if (chatName.trim()) {
      onSave(chatName.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${currentThemeConfig.bg} backdrop-blur-xl border ${currentThemeConfig.border} rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${currentThemeConfig.text}`}>Save Chat</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${currentThemeConfig.textSecondary} hover:${currentThemeConfig.text} transition-colors`}
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <p className={`${currentThemeConfig.textSecondary} mb-4`}>
          Give your chat a name to save it for later.
        </p>
        
        <input
          ref={inputRef}
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter chat name..."
          className={`w-full px-4 py-3 rounded-lg ${currentThemeConfig.input} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
        />
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onDiscard}
            className={`px-4 py-2 rounded-lg ${currentThemeConfig.textSecondary} hover:${currentThemeConfig.text} transition-colors`}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!chatName.trim()}
            className={`px-4 py-2 rounded-lg text-white ${currentThemeConfig.button} ${currentThemeConfig.buttonHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveChatModal;
