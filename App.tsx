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
import SaveChatModal from './components/SaveChatModal';
import { TrashIcon } from './components/icons/TrashIcon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { XIcon } from './components/icons/XIcon';
import { GoogleIcon } from './components/icons/GoogleIcon';

// Theme configurations
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-950',
    bgSecondary: 'bg-zinc-900/60',
    border: 'border-zinc-800/30',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    input: 'bg-zinc-900/80',
    hover: 'hover:bg-zinc-800/40',
    gradient: 'from-purple-600 to-blue-600',
    sidebar: 'bg-zinc-950 border-zinc-800/30'
  },
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    input: 'bg-white',
    hover: 'hover:bg-gray-100',
    gradient: 'from-purple-600 to-blue-600',
    sidebar: 'bg-white border-gray-200'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800/60',
    border: 'border-slate-700/30',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-800/80',
    hover: 'hover:bg-slate-700/40',
    gradient: 'from-indigo-600 to-cyan-600',
    sidebar: 'bg-slate-900 border-slate-700/30'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800/60',
    border: 'border-gray-700/30',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-800/80',
    hover: 'hover:bg-gray-700/40',
    gradient: 'from-green-600 to-emerald-600',
    sidebar: 'bg-gray-900 border-gray-700/30'
  }
};

// Enhanced Explore view: Theme-aware minimalist design
const ExploreView: React.FC<{ isMobile: boolean; theme: string }> = ({ isMobile, theme }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
      <div className={`text-center max-w-md lg:max-w-lg ${config.bgSecondary} backdrop-blur-xl rounded-2xl p-6 sm:p-8 border ${config.border} shadow-xl w-full transform transition-all duration-500 ${isMobile ? 'hover:scale-100' : 'hover:scale-[1.01]'}`}>
        <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-4 sm:mb-6 mx-auto">
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-xl opacity-60 animate-pulse`}></div>
          <div className={`relative ${config.bg} rounded-full p-2 sm:p-3 lg:p-4 border ${config.border} flex-shrink-0`}>
            <SearchIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-purple-400" />
          </div>
        </div>
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${config.text} mb-3 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Explore Creative Sparks</h2>
        <p className={`${config.textSecondary} leading-relaxed text-sm sm:text-base lg:text-lg`}>Discover design prompts, video templates, and branding ideas. Powered by AJ Studioz AI.</p>
        <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-75"></div>
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced HistoryView: Theme-aware minimalist design
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
  isMobile: boolean;
  theme: string;
}> = ({ chats, onLoad, onDelete, onCloseSidebar, isMobile, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
        <div className={`text-center ${config.bgSecondary} backdrop-blur-xl rounded-2xl p-6 sm:p-8 border ${config.border} shadow-xl w-full max-w-md lg:max-w-lg transform transition-all duration-500`}>
          <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-4 sm:mb-6 mx-auto">
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-xl opacity-60 animate-pulse`}></div>
            <div className={`relative ${config.bg} rounded-full p-2 sm:p-3 lg:p-4 border ${config.border} flex-shrink-0`}>
              <HistoryIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-purple-400" />
            </div>
          </div>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${config.text} mb-3 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>No Saved Designs</h2>
          <p className={`${config.textSecondary} mt-1 max-w-xs mx-auto leading-relaxed text-sm sm:text-base lg:text-lg`}>Start a creative chat and save it here for later inspiration.</p>
          {isMobile && (
            <p className={`text-xs ${config.textSecondary} mt-2`}>Swipe left on chats to delete</p>
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
    <div className={`flex flex-col h-full ${config.bg} min-h-0`}>
      <header className={`p-4 sm:px-10 border-b ${config.border} sticky top-0 ${config.bg}/90 backdrop-blur-xl z-10`}>
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${config.text} mb-2 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Design History</h2>
        <p className={`${config.textSecondary} mb-4 text-sm sm:text-base lg:text-lg`}>Load or archive your saved sessions.</p>
        <div className="relative mb-4">
          <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${config.textSecondary}`} />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl ${config.input} border ${config.border} ${config.text} focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all placeholder-${config.textSecondary} text-base min-h-[44px]`}
          />
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 sm:p-10 min-h-0">
        <ul className="space-y-3">
          {filteredChats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 rounded-xl ${config.bgSecondary} border ${config.border} transition-all backdrop-blur-xl relative overflow-hidden ${isMobile ? 'transform hover:scale-100' : 'hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-[1.01] cursor-pointer'}`}>
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
                <p className={`font-bold ${config.text} truncate text-sm sm:text-base lg:text-lg`}>{chat.name}</p>
                <p className={`text-xs ${config.textSecondary} mt-1`}>{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => handleDelete(chat.id)}
                aria-label={`Delete design: ${chat.name}`}
                title="Delete design"
                className={`self-start sm:self-auto ml-0 sm:ml-4 p-3 flex-shrink-0 rounded-xl ${config.textSecondary} hover:bg-red-900/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 active:scale-95 min-w-[44px] h-[44px] flex items-center justify-center`}
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
            <li className={`text-center py-8 ${config.textSecondary}`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${config.input} border ${config.border} mx-auto`}>
                <SearchIcon className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="text-sm lg:text-base">No designs found matching "{searchTerm}"</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void; isMobile: boolean; theme: string }> = ({ onPromptClick, isMobile, theme }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <div className="flex-grow flex items-center justify-center px-4 min-h-0 pt-4 sm:pt-0">
      <div className="text-center w-full max-w-2xl lg:max-w-3xl">
        <div className={`inline-block p-4 sm:p-6 ${config.bgSecondary} border ${config.border} rounded-2xl mb-4 sm:mb-6 backdrop-blur-xl shadow-xl mx-auto`}>
          <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
            <div className={`p-2 sm:p-3 ${theme === 'light' ? 'bg-white' : 'bg-zinc-950'} rounded-full`}>
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
        <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-bold ${config.text} mb-2 tracking-tight animate-in fade-in duration-500 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Ready to Create?</h1>
        <p className={`${config.textSecondary} mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base lg:text-lg`}>Spark your next project with AJ Studioz AI. Ask anything to get started.</p>
      </div>
    </div>
  );
};

// Enhanced AJ Loading Indicator
const AJLoadingIndicator: React.FC<{ theme: string }> = ({ theme }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <img 
            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
            alt="AJ Studioz Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-ping opacity-75"></div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <p className={`text-sm font-medium ${config.textSecondary}`}>AJ is thinking...</p>
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [highlightTheme, setHighlightTheme] = useState<HighlightTheme>('atom-one-dark');
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Get current theme configuration
  const currentThemeConfig = themeConfigs[theme] || themeConfigs.dark;

  // Enhanced mobile detection with touch support
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('app-theme', theme);

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
  }, [theme]);

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

  // Google Sign-In functionality
  const handleGoogleSignIn = async () => {
    setIsGoogleSignInLoading(true);
    try {
      // This is a placeholder for Google Sign-In implementation
      // In a real app, you would use the Google Sign-In library or Firebase Auth
      // For now, we'll simulate a successful sign-in
      setTimeout(() => {
        setUser({
          name: 'Alex Jordan',
          email: 'alex.jordan@ajstudioz.com',
          photoUrl: 'https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e'
        });
        setIsGoogleSignInLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
      setIsGoogleSignInLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    // In a real app, you would also sign out from Google
  };

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

  // Enhanced Error toast with mobile positioning (FIXED: Removed extra </div>)
  const ErrorToast = () => error ? (
    <div className={`fixed ${isMobile ? 'top-16 sm:top-4' : 'top-4'} right-4 z-50 p-4 rounded-xl shadow-xl max-w-sm w-full mx-4 animate-in slide-in-from-top-2 duration-300 ${currentThemeConfig.bgSecondary} ${currentThemeConfig.text} border ${currentThemeConfig.border} backdrop-blur-xl`}>
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

  // Google Sign-In Modal
  const GoogleSignInModal = () => (
    <div className={`fixed inset-0 ${currentThemeConfig.bg}/90 backdrop-blur-xl z-50 flex items-center justify-center p-4`}>
      <div className={`${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} rounded-2xl p-6 max-w-md w-full shadow-xl`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <img 
              src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
              alt="AJ Studioz Logo" 
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <h2 className={`text-2xl font-bold ${currentThemeConfig.text} mb-2`}>Welcome to AJ Studioz</h2>
          <p className={currentThemeConfig.textSecondary}>Sign in to unlock premium features and save your designs</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleSignInLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleSignInLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          Sign in with Google
        </button>
        
        <div className="mt-4 text-center">
          <p className={`text-xs ${currentThemeConfig.textSecondary}`}>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );

  // Enhanced GlobalStyles with theme support (FIXED: Cleaned broken CSS rule)
  const GlobalStyles = () => (
    <style jsx global>{`
      :root {
        --bg-primary: ${theme === 'light' ? '#ffffff' : theme === 'z-ai' ? '#0f172a' : theme === 'chatgpt' ? '#111827' : '#09090b'};
        --bg-secondary: ${theme === 'light' ? '#f9fafb' : theme === 'z-ai' ? '#1e293b' : theme === 'chatgpt' ? '#1f2937' : '#18181b'};
        --bg-tertiary: ${theme === 'light' ? '#f3f4f6' : theme === 'z-ai' ? '#334155' : theme === 'chatgpt' ? '#374151' : '#27272a'};
        --border-color: ${theme === 'light' ? '#e5e7eb' : theme === 'z-ai' ? '#334155' : theme === 'chatgpt' ? '#374151' : '#27272a'};
        --text-primary: ${theme === 'light' ? '#111827' : '#ffffff'};
        --text-secondary: ${theme === 'light' ? '#6b7280' : '#a1a1aa'};
        --accent-gradient: ${theme === 'z-ai' ? 'linear-gradient(to right, #4f46e5, #06b6d4)' : theme === 'chatgpt' ? 'linear-gradient(to right, #16a34a, #10b981)' : 'linear-gradient(to right, #9333ea, #3b82f6)'};
      }
      
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }
      
      @keyframes float-glow {
        0% { 
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(139, 92, 246, 0.05); 
          transform: translateY(0px);
        }
        100% { 
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.1), 0 0 30px rgba(59, 130, 246, 0.05); 
          transform: translateY(-1px);
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
      /* Laptop: Enhanced hovers and cursors */
      @media (min-width: 1024px) {
        .hover\\:shadow-xl:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.15);
        }
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
        background: rgba(139, 92, 246, 0.4);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.5);
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
      /* Ensure last message is fully visible */
      .chat-container {
        padding-bottom: 80px;
      }
    `}</style>
  );

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <div className={`flex h-screen font-sans transition-all duration-500 ease-in-out overflow-hidden ${currentThemeConfig.bg} ${currentThemeConfig.text}`}>
        {/* Theme-aware background effects */}
        <div className={`fixed inset-0 ${currentThemeConfig.bg}`}></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/3 via-transparent to-transparent"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/3 via-transparent to-transparent"></div>
        
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
              theme={theme}
          />
        )}
        
        {/* Google Sign-In Modal */}
        {!user && <GoogleSignInModal />}
        
        {isSidebarOpen && (
          <div 
            className={`fixed inset-0 ${currentThemeConfig.bg}/60 z-30 md:hidden backdrop-blur-xl`}
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
          user={user}
          onSignOut={handleSignOut}
        />
        <div className="flex flex-col flex-grow h-screen relative">
          <header className={`flex items-center justify-between p-3 border-b md:hidden sticky top-0 backdrop-blur-xl z-10 transition-all duration-500 ${currentThemeConfig.bg}/95 ${currentThemeConfig.border}`}>
              <button onClick={toggleSidebar} className={`p-3 -ml-2 rounded-lg transition-all touch-manipulation active:scale-[0.95] ${currentThemeConfig.text} ${currentThemeConfig.hover} min-w-[44px] h-[44px] flex items-center justify-center`}>
                <MenuIcon className="h-6 w-6"/>
              </button>
              <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${currentThemeConfig.bgSecondary}`}>
                    <AJStudiozIcon className="h-5 w-5 text-white"/>
                  </div>
                  <h1 className="text-base font-bold tracking-wide text-white">AJ STUDIOZ</h1>
              </div>
              <div className="w-6"></div>
          </header>

          {/* Main content with dynamic bottom padding for input/keyboard */}
          <main 
            ref={chatContainerRef} 
            className="chat-container flex-grow overflow-y-auto px-4 sm:px-10 lg:px-20 flex flex-col relative z-10 transition-all duration-300"
          >
            {currentView === 'chat' ? (
              messages.length === 0 ? (
                <ChatWelcome onPromptClick={() => {}} isMobile={isMobile} theme={theme} />
              ) : (
                <div className="max-w-3xl lg:max-w-4xl mx-auto w-full pt-4 space-y-0">
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
                        theme={theme}
                      />
                    );
                  })}

                  {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                      <AJLoadingIndicator theme={theme} />
                  )}
                </div>
              )
            ) : currentView === 'explore' ? (
              <ExploreView isMobile={isMobile} theme={theme} />
            ) : (
              <HistoryView 
                chats={savedChats}
                onLoad={handleLoadChat}
                onDelete={handleDeleteChat}
                onCloseSidebar={toggleSidebar}
                isMobile={isMobile}
                theme={theme}
              />
            )}
          </main>
        </div>

        {/* Floating Input - always visible in chat view */}
        {currentView === 'chat' && (
          <div className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300">
            <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} theme={theme} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
