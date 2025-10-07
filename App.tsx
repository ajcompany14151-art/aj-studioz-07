// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Message, MessageRole, HighlightTheme, Theme, AppView, SavedChat } from './types';
import { createChatSession } from './services/geminiService';
import type { Chat } from '@google/genai';
import { MenuIcon } from './components/icons/MenuIcon';
import { AJStudiozIcon } from './components/icons/AJStudiozIcon';
import { SearchIcon } from './components/icons/SearchIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { SaveChatModal } from './components/SaveChatModal';
import { TrashIcon } from './components/icons/TrashIcon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { XIcon } from './components/icons/XIcon';

// Enhanced Explore view with Grok-like interactive elements and mobile optimization
const ExploreView: React.FC = () => (
  <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
    <div className="text-center max-w-md bg-black/90 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-zinc-700/30 shadow-2xl shadow-black/50 w-full transform transition-all duration-500 hover:scale-[1.02] md:hover:scale-100">
      <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-70 animate-pulse"></div>
        <div className="relative bg-black/80 rounded-full p-3 sm:p-4 border border-zinc-700/50 flex-shrink-0">
          <SearchIcon className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Explore Creative Sparks</h2>
      <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">Discover design prompts, video templates, and branding ideas. Powered by AJ Studioz AI—coming soon with semantic search.</p>
      <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-75"></div>
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-150"></div>
      </div>
    </div>
  </div>
);

// Enhanced HistoryView with better mobile search and swipe gestures hint
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
  isMobile: boolean;
}> = ({ chats, onLoad, onDelete, onCloseSidebar, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
        <div className="text-center bg-black/90 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-zinc-700/30 shadow-2xl shadow-black/50 w-full max-w-md transform transition-all duration-500">
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-70 animate-pulse"></div>
            <div className="relative bg-black/80 rounded-full p-3 sm:p-4 border border-zinc-700/50 flex-shrink-0">
              <HistoryIcon className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">No Saved Designs</h2>
          <p className="text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed text-sm sm:text-base">Start a creative chat and save it here for later inspiration.</p>
          {isMobile && (
            <p className="text-xs text-zinc-500 mt-2">Swipe left on chats to delete</p>
          )}
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleDelete = async (chatId: string) => {
    setIsDeleting(chatId);
    await onDelete(chatId);
    setIsDeleting(null);
  };

  const handleChatPress = (chatId: string) => {
    onLoad(chatId);
    if (isMobile) onCloseSidebar();
  };
  
  return (
    <div className="flex flex-col h-full bg-black min-h-0">
      <header className="p-4 sm:px-10 border-b border-zinc-700/30 sticky top-0 bg-black/90 backdrop-blur-xl z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Design History</h2>
        <p className="text-zinc-400 mb-4 text-sm sm:text-base">Load or archive your saved sessions.</p>
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/70 border border-zinc-700/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all placeholder-zinc-500 text-base min-h-[44px]"
          />
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 sm:p-10 min-h-0">
        <ul className="space-y-3">
          {filteredChats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/70 border border-zinc-700/30 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl transform hover:scale-[1.01] md:hover:scale-100 relative overflow-hidden">
              {/* Mobile swipe delete overlay */}
              {isMobile && (
                <div className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4">
                  <TrashIcon className="h-5 w-5 text-red-300" />
                  <span className="text-xs text-red-200 ml-2">Swipe to delete</span>
                </div>
              )}
              <button 
                onClick={() => handleChatPress(chat.id)} 
                className="flex-grow text-left overflow-hidden touch-manipulation active:scale-[0.98] w-full sm:w-auto mb-2 sm:mb-0 min-h-[44px] flex items-center"
                aria-label={`Load design: ${chat.name}`}
              >
                <p className="font-bold text-white truncate text-sm sm:text-base">{chat.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => handleDelete(chat.id)}
                aria-label={`Delete design: ${chat.name}`}
                title="Delete design"
                className="self-start sm:self-auto ml-0 sm:ml-4 p-3 flex-shrink-0 rounded-xl text-zinc-500 hover:bg-red-900/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 active:scale-95 min-w-[44px] h-[44px] flex items-center justify-center"
                disabled={isDeleting === chat.id}
              >
                {isDeleting === chat.id ? (
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
              </button>
            </li>
          ))}
          {searchTerm && filteredChats.length === 0 && (
            <li className="text-center py-8 text-zinc-400">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-black/50 border border-zinc-700/50 mx-auto">
                <SearchIcon className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="text-sm">No designs found matching "{searchTerm}"</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// AJ Studioz-specific suggested prompts (creative focus)
const SUGGESTED_PROMPTS = [
  { title: "Logo Magic", prompt: "Design a modern logo for a sustainable fashion brand.", icon: "🎨" },
  { title: "Video Vision", prompt: "Storyboard a 30-second promo video for a tech gadget.", icon: "📹" },
  { title: "Brand Boost", prompt: "Create a color palette and typography guide for a coffee shop.", icon: "☕" },
  { title: "Idea Storm", prompt: "Brainstorm 5 poster concepts for a music festival.", icon: "🎶" },
];

const SuggestedPrompts: React.FC<{ onPromptClick: (prompt: string) => void; isMobile: boolean }> = ({ onPromptClick, isMobile }) => (
  <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-2 sm:p-0">
    {SUGGESTED_PROMPTS.map(({ title, prompt, icon }) => (
      <button
        key={title}
        onClick={() => onPromptClick(prompt)}
        className="p-4 sm:p-6 bg-black/70 border border-zinc-700/30 rounded-2xl text-left hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all backdrop-blur-xl touch-manipulation active:scale-[0.98] min-h-[100px] sm:min-h-[120px] transform hover:scale-[1.02] md:hover:scale-100 group min-h-[44px] flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform flex-shrink-0 mt-1">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm mb-2 truncate">{title}</p>
            <p className="text-zinc-400 leading-relaxed text-xs sm:text-sm overflow-hidden line-clamp-3">{prompt}</p>
          </div>
        </div>
      </button>
    ))}
  </div>
);

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void; isMobile: boolean }> = ({ onPromptClick, isMobile }) => (
  <div className="flex-grow flex items-center justify-center px-4 min-h-0 pt-4 sm:pt-0">
    <div className="text-center w-full max-w-2xl">
      <div className="inline-block p-4 sm:p-6 bg-black/90 border border-zinc-700/30 rounded-3xl mb-4 sm:mb-6 backdrop-blur-xl shadow-2xl shadow-black/50 transform transition-all duration-500 hover:scale-[1.02] mx-auto">
        <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
          <div className="p-2 sm:p-3 bg-black rounded-full">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 tracking-tight animate-in fade-in duration-500 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Ready to Create?</h1>
      <p className="text-zinc-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">Spark your next project with AJ Studioz AI. Pick a prompt or dream big.</p>
      <SuggestedPrompts onPromptClick={onPromptClick} isMobile={isMobile} />
    </div>
  </div>
);

const getInitialTheme = (): Theme => 'dark'; // Always premium dark

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark'); // Locked to dark
  const [highlightTheme, setHighlightTheme] = useState<HighlightTheme>('atom-one-dark');
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Enhanced mobile detection with touch support
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to lock premium dark theme with mobile viewport fix
  useEffect(() => {
    document.documentElement.classList.add('dark', 'premium-dark');
    localStorage.setItem('app-theme', 'dark');

    // Enhanced mobile viewport with user-scalable=no for better control
    if (typeof document !== 'undefined') {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        document.head.appendChild(viewport);
      } else {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      }
    }
  }, []);

  useEffect(() => {
    // Load saved chats from local storage on mount
    try {
        const saved = localStorage.getItem('saved-chats');
        if (saved) {
            setSavedChats(JSON.parse(saved));
        }
    } catch (error) {
        console.error("Failed to load chats from localStorage", error);
        setSavedChats([]);
    }

    const savedTheme = localStorage.getItem('hljs-theme') as HighlightTheme;
    if (savedTheme) {
      setHighlightTheme(savedTheme);
    }
    chatSessionRef.current = createChatSession();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError('Offline mode: Saving chats locally. Reconnect for AI magic.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced focus effect for chat input with mobile delay
  useEffect(() => {
    if (currentView === 'chat' && !isMobile) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentView, isMobile]);

  // Effect for code highlight theme
  useEffect(() => {
    const themeUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${highlightTheme}.min.css`;
    const linkElement = document.getElementById('hljs-theme-link') as HTMLLinkElement;
    if (linkElement && linkElement.href !== themeUrl) {
      linkElement.href = themeUrl;
    }
    localStorage.setItem('hljs-theme', highlightTheme);
  }, [highlightTheme]);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (currentView !== 'chat') return;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    scrollToBottom(isNewMessage && messages[messages.length-1]?.role === MessageRole.USER ? 'smooth' : 'auto');
    prevMessagesLengthRef.current = messages.length;
  }, [messages, scrollToBottom, currentView]);

  useEffect(() => {
    const handleResize = () => scrollToBottom('auto');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToBottom]);

  // Enhanced body scroll lock for mobile sidebar
  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.body.style.position = ''; 
      document.body.style.width = ''; 
      document.body.style.top = '';
    };
  }, [isSidebarOpen, isMobile]);

  // Advanced mobile keyboard avoidance with visualViewport
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        const visualViewport = (window as any).visualViewport;
        if (visualViewport) {
          const keyboardHeight = window.innerHeight - visualViewport.height;
          if (keyboardHeight > 100) { // Threshold for actual keyboard
            document.body.style.paddingBottom = `${keyboardHeight + 20}px`; // Extra for input
            scrollToBottom('auto'); // Auto-scroll on resize
          } else {
            document.body.style.paddingBottom = '';
          }
        }
      }
    };

    const handleFocus = () => {
      setTimeout(handleResize, 0);
    };

    const textarea = inputRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
      }
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingBottom = '';
    };
  }, [isMobile, scrollToBottom]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = useCallback(async (content?: string) => {
    const messageContent = (content || input).trim();
    if (isLoading || !messageContent) return;

    if (currentChatId) {
        setCurrentChatId(null);
    }

    const userMessage: Message = { role: MessageRole.USER, content: messageContent };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    setMessages(prev => [...prev, { role: MessageRole.MODEL, content: '' }]);

    try {
      if (!chatSessionRef.current) {
        throw new Error("Chat session not initialized");
      }
      
      const stream = await chatSessionRef.current.sendMessageStream({ message: userMessage.content });
      
      let streamedText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          streamedText += chunk.text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: MessageRole.MODEL, content: streamedText };
            return newMessages;
          });
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(`Design glitch: ${errorMessage}. Retry your vision?`);
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: MessageRole.MODEL, content: `Oops, creative block: ${errorMessage}. Let's try that again!` };
          return newMessages;
      });
    } finally {
      setIsLoading(false);
      // Focus only on desktop; mobile handles via keyboard
      if (!isMobile) {
        inputRef.current?.focus();
      }
    }
  }, [input, isLoading, currentChatId, isMobile]);

  const handleSaveChat = useCallback((name: string) => {
    const newChat: SavedChat = {
        id: `chat-${Date.now()}`,
        name,
        timestamp: Date.now(),
        messages,
    };
    const updatedChats = [...savedChats, newChat];
    setSavedChats(updatedChats);
    localStorage.setItem('saved-chats', JSON.stringify(updatedChats));
    setCurrentChatId(newChat.id);
  }, [messages, savedChats]);

  const handleLoadChat = useCallback((chatId: string) => {
    const chatToLoad = savedChats.find(chat => chat.id === chatId);
    if (chatToLoad) {
        setMessages(chatToLoad.messages);
        setCurrentChatId(chatToLoad.id);
        chatSessionRef.current = createChatSession(chatToLoad.messages);
        setCurrentView('chat');
    }
  }, [savedChats]);

  const handleDeleteChat = useCallback((chatId: string) => {
    if (window.confirm('Archive this design session? It\'s gone forever—poof!')) {
        const newSavedChats = savedChats.filter(chat => chat.id !== chatId);
        setSavedChats(newSavedChats);
        localStorage.setItem('saved-chats', JSON.stringify(newSavedChats));

        if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(null);
            chatSessionRef.current = createChatSession();
        }
    }
  }, [savedChats, currentChatId]);

  const handleNewChat = useCallback(() => {
    if (messages.length > 0 && currentChatId === null) {
      setIsSaveModalOpen(true);
    } else {
      setMessages([]);
      setCurrentChatId(null);
      chatSessionRef.current = createChatSession();
    }
  }, [messages, currentChatId]);

  const handlePromptClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  // Define the pattern URL as a constant to avoid escaping issues
  const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  // Enhanced Error toast with mobile positioning
  const ErrorToast = () => error ? (
    <div className={`fixed ${isMobile ? 'top-16 sm:top-4' : 'top-4'} right-4 z-50 p-4 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-top-2 duration-300 bg-red-900/90 text-white border border-red-700/50 backdrop-blur-xl`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        <div className="ml-auto flex-shrink-0 min-w-[32px] h-[32px]">
          <button
            type="button"
            className="inline-flex text-red-400 hover:text-red-300 focus:outline-none p-1"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Enhanced Online status with mobile bottom positioning
  const OnlineStatus = () => (
    <div className={`fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300 ${isMobile ? 'bottom-20' : 'bottom-4'} ${isOnline ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'} backdrop-blur-xl`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      {isOnline ? 'Connected' : 'Offline'}
    </div>
  );

  // Enhanced GlobalStyles with more mobile optimizations
  const GlobalStyles = () => (
    <style jsx global>{`
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
      .animate-float-glow {
        animation: float-glow 4s ease-in-out infinite alternate;
      }
      .animate-float-glow:hover {
        animation-duration: 2.5s;
      }
      .animate-float-glow:focus-within {
        animation-play-state: paused;
      }
      /* Enhanced Mobile: Prevent horizontal scroll and bounce */
      @media (max-width: 768px) {
        body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }
        /* Safe area insets for iOS */
        :root {
          --safe-area-inset-top: env(safe-area-inset-top);
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
        }
        header { padding-top: var(--safe-area-inset-top, 0); }
      }
      /* Touch target min size enhanced */
      button, [role="button"], .touch-target {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }
      /* Custom scrollbar with mobile hide */
      ::-webkit-scrollbar {
        width: 6px;
      }
      @media (max-width: 768px) {
        ::-webkit-scrollbar { width: 0; }
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }
      /* iOS input zoom fix */
      input[type="text"], input[type="email"], textarea {
        font-size: 16px !important;
      }
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      /* Prevent text selection with mobile exceptions */
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      input, textarea, [contenteditable] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      /* Line clamp for mobile text overflow */
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <div className="flex h-screen font-sans transition-all duration-500 ease-in-out overflow-hidden bg-black text-white">
        {/* Premium dark mode background effects with mobile perf */}
        <div className="fixed inset-0 bg-black"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent"></div>
        {!isMobile && (
          <>
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </>
        )}
        <div className="fixed inset-0 opacity-10" style={{ backgroundImage: `url('${patternUrl}')` }}></div>
        
        <ErrorToast />
        <OnlineStatus />
        
        {isSaveModalOpen && (
          <SaveChatModal
              onClose={() => setIsSaveModalOpen(false)}
              onSave={(name) => {
                  handleSaveChat(name);
                  setMessages([]);
                  setCurrentChatId(null);
                  chatSessionRef.current = createChatSession();
                  setIsSaveModalOpen(false);
              }}
              onDiscard={() => {
                  setMessages([]);
                  setCurrentChatId(null);
                  chatSessionRef.current = createChatSession();
                  setIsSaveModalOpen(false);
              }}
          />
        )}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-2xl"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        <Sidebar 
          onNewChat={handleNewChat} 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar}
          theme={theme}
          setTheme={setTheme}
          highlightTheme={highlightTheme}
          setHighlightTheme={setHighlightTheme}
          currentView={currentView}
          onViewChange={setCurrentView}
          isMobile={isMobile}
        />
        <div className="flex flex-col flex-grow h-screen relative">
          <header className="flex items-center justify-between p-3 border-b md:hidden sticky top-0 backdrop-blur-2xl z-10 transition-all duration-500 bg-black/95 border-zinc-700/30">
              <button onClick={toggleSidebar} className="p-3 -ml-2 rounded-2xl transition-all touch-manipulation active:scale-[0.95] text-white hover:bg-zinc-900/50 min-w-[44px] h-[44px] flex items-center justify-center">
                <MenuIcon className="h-6 w-6"/>
              </button>
              <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-2xl bg-zinc-900/50">
                    <AJStudiozIcon className="h-5 w-5 text-white"/>
                  </div>
                  <h1 className="text-base font-bold tracking-wide text-white">AJ STUDIOZ</h1>
              </div>
              <div className="w-6"></div>
          </header>

          {/* Main content with dynamic bottom padding for input/keyboard */}
          <main ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 sm:px-10 flex flex-col relative z-10 pb-28 sm:pb-32" style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : '0' }}>
            {currentView === 'chat' ? (
              messages.length === 0 ? (
                <ChatWelcome onPromptClick={handlePromptClick} isMobile={isMobile} />
              ) : (
                <div className="max-w-4xl mx-auto w-full pt-4 space-y-0">
                  {messages.map((msg, index) => {
                    const isTypingPlaceholder = isLoading && index === messages.length - 1 && msg.role === MessageRole.MODEL && msg.content === '';
                    if (isTypingPlaceholder) return null;

                    return (
                      <ChatMessage
                        key={`${msg.role}-${index}`}
                        message={msg}
                        isLoading={isLoading}
                        isLastMessage={index === messages.length - 1}
                        isMobile={isMobile}
                      />
                    );
                  })}

                  {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                      <div className="py-6 px-2">
                          <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700/30 flex items-center justify-center backdrop-blur-xl bg-black/50">
                                  <AJStudiozIcon className="h-5 w-5 text-white"/>
                              </div>
                              <div className="flex items-center gap-2 pt-1.5">
                                  <SpinnerIcon className="h-5 w-5 animate-spin text-purple-400" />
                                  <span className="text-sm font-medium text-white">AJ is ideating...</span>
                              </div>
                          </div>
                      </div>
                  )}
                </div>
              )
            ) : currentView === 'explore' ? (
              <ExploreView />
            ) : (
              <HistoryView 
                chats={savedChats}
                onLoad={handleLoadChat}
                onDelete={handleDeleteChat}
                onCloseSidebar={toggleSidebar}
                isMobile={isMobile}
              />
            )}
          </main>
        </div>

        {/* Floating Input - always visible in chat view */}
        {currentView === 'chat' && (
          <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
