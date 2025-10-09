// components/ChatInput.tsx
import React, { useEffect, KeyboardEvent, forwardRef, useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicIcon } from './icons/MicIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ImageIcon } from './icons/ImageIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ModelIcon } from './icons/ModelIcon';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  theme: string;
  onImageUpload?: (file: File) => void;
  onVoiceInput?: () => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  availableModels?: { id: string; name: string }[];
}

// Enhanced Theme configurations with corporate polish
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-white',
    placeholder: 'placeholder-zinc-500',
    focusBorder: 'focus:border-zinc-700',
    gradient: 'from-purple-600 to-blue-600',
    accent: 'text-purple-400',
    secondary: 'text-zinc-400'
  },
  light: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    placeholder: 'placeholder-gray-500',
    focusBorder: 'focus:border-gray-300',
    gradient: 'from-purple-600 to-blue-600',
    accent: 'text-purple-600',
    secondary: 'text-gray-500'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    placeholder: 'placeholder-slate-400',
    focusBorder: 'focus:border-slate-700',
    gradient: 'from-indigo-600 to-cyan-600',
    accent: 'text-indigo-400',
    secondary: 'text-slate-400'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    border: 'border-gray-800',
    text: 'text-white',
    placeholder: 'placeholder-gray-400',
    focusBorder: 'focus:border-gray-700',
    gradient: 'from-green-600 to-emerald-600',
    accent: 'text-emerald-400',
    secondary: 'text-gray-400'
  }
};

const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      value,
      onChange,
      onSend,
      isLoading,
      theme,
      onImageUpload,
      onVoiceInput,
      selectedModel,
      onModelChange,
      availableModels = [
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-flash', name: 'Gemini Flash' },
        { id: 'gpt-4', name: 'GPT-4' }
      ]
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [fileInputOpen, setFileInputOpen] = useState(false);
    const isDisabled = isLoading || !value.trim();
    const maxChars = 5000;
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    
    const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
    const charCount = value.length;

    // Enhanced mobile detection
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Voice recording logic (Grok-like voice mode)
    const startRecording = async () => {
      if (!onVoiceInput) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          // Simulate transcription (in production, send to Whisper API)
          const transcribedText = 'Transcribed: Your voice input here...'; // Placeholder
          onVoiceInput();
          onChange(transcribedText);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Voice recording failed:', err);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!isDisabled) {
          onSend();
        }
      }
    };

    // Enhanced file upload with drag-and-drop
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
      const file = e instanceof DragEvent ? e.dataTransfer?.files[0] : e.target.files?.[0];
      if (file && onImageUpload && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
      setFileInputOpen(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFileUpload(e);
    };

    // Mobile zoom prevention
    useEffect(() => {
      const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
      if (textarea) {
        const handleFocus = () => {
          setIsFocused(true);
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
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:pb-6">
        <div 
          ref={inputContainerRef}
          className={`
            relative mx-auto transition-all duration-300 ease-out
            ${isMobile ? 'max-w-full' : 'max-w-4xl'}
            ${isFocused ? 'scale-[1.01] shadow-2xl' : 'scale-100 shadow-lg'}
          `}
        >
          {/* Enhanced input container with model selector */}
          <div 
            className={`
              relative flex items-center gap-2 px-4 py-3
              ${currentThemeConfig.bg} 
              border ${currentThemeConfig.border}
              rounded-2xl shadow-lg
              transition-all duration-300
              ${isFocused 
                ? `${currentThemeConfig.focusBorder} shadow-xl ring-2 ring-purple-500/20` 
                : 'hover:shadow-xl hover:border-purple-500/30'
              }
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Model selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className={`p-1.5 rounded-xl transition-all ${currentThemeConfig.secondary} hover:${currentThemeConfig.accent} flex-shrink-0`}
                aria-label="Select model"
              >
                <ModelIcon className="h-4 w-4" />
                <ChevronDownIcon className={`h-3 w-3 ml-1 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showModelDropdown && (
                <div className={`absolute bottom-full left-0 mb-2 w-48 bg-${theme === 'light' ? 'white' : 'zinc-900'} border ${currentThemeConfig.border} rounded-xl shadow-2xl py-1 z-10`}>
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange?.(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${selectedModel === model.id ? `${currentThemeConfig.accent} bg-purple-500/10` : currentThemeConfig.text}`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* File upload with drag hint */}
            <label className="relative flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 rounded-xl transition-all ${currentThemeConfig.secondary} hover:${currentThemeConfig.accent}`}
                aria-label="Upload image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              {fileInputOpen && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-purple-400 bg-purple-900/90 px-2 py-1 rounded whitespace-nowrap">
                  Drop image here
                </div>
              )}
            </label>

            <div className="relative flex-1 min-w-0">
              <textarea
                ref={ref}
                id="chat-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask AJ Studioz anything... (e.g., 'Design a modern logo for my brand')"
                className={`
                  flex-1 bg-transparent ${currentThemeConfig.text} resize-none 
                  focus:outline-none focus:placeholder-transparent
                  disabled:cursor-not-allowed
                  ${currentThemeConfig.placeholder} text-sm leading-relaxed
                  py-1 px-2
                  min-h-[20px]
                  ${isMobile ? 'text-base' : ''}
                `}
                disabled={isLoading}
                aria-label="Chat input"
                maxLength={maxChars}
                spellCheck={true}
                autoCapitalize="sentences"
                autoCorrect="on"
                style={{ fontSize: isMobile ? '16px' : 'inherit' }}
              />
              
              {/* Enhanced character count with progress bar */}
              {charCount > maxChars * 0.8 && (
                <div className="absolute bottom-1 right-1 flex items-center gap-1 text-xs transition-all duration-300">
                  <div className="w-12 h-1 bg-zinc-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${charCount > maxChars * 0.9 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${(charCount / maxChars) * 100}%` }}
                    />
                  </div>
                  <span className={charCount > maxChars * 0.9 ? 'text-red-400' : 'text-zinc-500'}>
                    {charCount}/{maxChars}
                  </span>
                </div>
              )}
            </div>

            {/* Voice input button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!onVoiceInput}
              aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
              className={`p-1.5 rounded-xl transition-all flex-shrink-0 relative ${currentThemeConfig.secondary} hover:${currentThemeConfig.accent} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <MicIcon className={`h-4 w-4 transition-all ${isRecording ? 'text-red-400 scale-110' : ''}`} />
              {isRecording && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              )}
            </button>

            {/* Send button with enhanced feedback */}
            <button
              onClick={onSend}
              disabled={isDisabled}
              aria-label={isLoading ? "Sending..." : "Send message"}
              className={`
                relative p-2.5 rounded-xl transition-all duration-300 transform flex-shrink-0 group
                ${isDisabled
                  ? 'text-zinc-600 cursor-not-allowed opacity-50'
                  : `bg-gradient-to-r ${currentThemeConfig.gradient} text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`
                }
              `}
            >
              <div className="relative z-10">
                {isLoading ? (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                    <SparklesIcon className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ChatInputComponent.displayName = 'ChatInput';

const ChatInput = React.memo(ChatInputComponent);

export { ChatInput };
