// App.tsx (Major enhancements: Model selection, image upload, analytics view, premium logic, better error handling, corporate UX)
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
import { BarChartIcon } from './components/icons/BarChartIcon';
import TypingIndicator from './components/TypingIndicator';
import { CrownIcon } from './components/icons/CrownIcon';

// Enhanced theme configs
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-950',
    bgSecondary: 'bg-zinc-900/80 backdrop-blur-xl',
    border: 'border-zinc-800/40',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    input: 'bg-zinc-900/80',
    hover: 'hover:bg-zinc-800/50',
    gradient: 'from-purple-600 to-blue-600',
    sidebar: 'bg-zinc-950 border-zinc-800/40'
  },
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50/80 backdrop-blur-xl',
    border: 'border-gray-200/40',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    input: 'bg-white',
    hover: 'hover:bg-gray-100/50',
    gradient: 'from-purple-600 to-blue-600',
    sidebar: 'bg-white border-gray-200/40'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800/80 backdrop-blur-xl',
    border: 'border-slate-700/40',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-800/80',
    hover: 'hover:bg-slate-700/50',
    gradient: 'from-indigo-600 to-cyan-600',
    sidebar: 'bg-slate-900 border-slate-700/40'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800/80 backdrop-blur-xl',
    border: 'border-gray-700/40',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-800/80',
    hover: 'hover:bg-gray-700/50',
    gradient: 'from-green-600 to-emerald-600',
    sidebar: 'bg-gray-900 border-gray-700/40'
  }
};

// Analytics View
const AnalyticsView: React.FC<{ theme: string; isMobile: boolean }> = ({ theme, isMobile }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  const mockData = { totalQueries: 150, avgResponseTime: 2.3, satisfaction: 4.8 };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 min-h-0 ${config.bg}">
      <header className={`p-4 border-b ${config.border} sticky top-0 ${config.bg}/90 backdrop-blur-xl z-10`}>
        <h2 className={`text-2xl font-bold ${config.text} mb-2 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Design Analytics</h2>
        <p className={`${config.textSecondary} text-sm`}>Insights into your creative workflow.</p>
      </header>
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${config.bgSecondary} border ${config.border} rounded-2xl p-6 shadow-xl`}>
            <p className={`${config.textSecondary} text-sm mb-2`}>Total Queries</p>
            <p className={`${config.text} text-3xl font-bold`}>{mockData.totalQueries}</p>
          </div>
          <div className={`${config.bgSecondary} border ${config.border} rounded-2xl p-6 shadow-xl`}>
            <p className={`${config.textSecondary} text-sm mb-2`}>Avg Response Time</p>
            <p className={`${config.text} text-3xl font-bold`}>{mockData.avgResponseTime}s</p>
          </div>
          <div className={`${config.bgSecondary} border ${config.border} rounded-2xl p-6 shadow-xl`}>
            <p className={`${config.textSecondary} text-sm mb-2`}>Satisfaction Score</p>
            <p className={`${config.text} text-3xl font-bold`}>{mockData.satisfaction}/5</p>
          </div>
        </div>
        {/* Mock chart - in production, integrate Chart.js */}
        <div className={`${config.bgSecondary} border ${config.border} rounded-2xl p-6 shadow-xl`}>
          <h3 className={`${config.text} text-lg font-semibold mb-4`}>Query Trends</h3>
          <div className="h-64 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
            <p className={`${config.textSecondary}`}>Interactive chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Explore and History views (reuse previous, add premium badges)
const ExploreView: React.FC<{ isMobile: boolean; theme: string; premium?: boolean }> = ({ isMobile, theme, premium }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
      <div className={`text-center max-w-lg ${config.bgSecondary} backdrop-blur-xl rounded-2xl p-8 border ${config.border} shadow-2xl w-full transform transition-all duration-500 hover:scale-[1.02]`}>
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6 mx-auto">
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-xl opacity-60 animate-pulse`}></div>
          <div className={`relative ${config.bg} rounded-full p-3 border ${config.border}`}>
            <SearchIcon className="h-8 w-8 text-purple-400" />
          </div>
          {premium && <CrownIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-bounce" />}
        </div>
        <h2 className={`text-3xl font-bold ${config.text} mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Premium Design Sparks</h2>
        <p className={`${config.textSecondary} leading-relaxed text-lg mb-6`}>Unlock exclusive templates and AI prompts for your brand.</p>
        <div className="flex justify-center space-x-2 mb-6">
          <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
          <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
        <button className={`px-6 py-3 rounded-xl font-semibold transition-all ${config.gradient} text-white hover:shadow-xl shadow-lg`}>
          Explore Premium
        </button>
      </div>
    </div>
  );
};

// HistoryView (enhanced with search and sorting)
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
  isMobile: boolean;
  theme: string;
  premium?: boolean;
}> = ({ chats, onLoad, onDelete, onCloseSidebar, isMobile, theme, premium }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedChats = sortBy === 'date' ? filteredChats.sort((a, b) => b.timestamp - a.timestamp) : filteredChats.sort((a, b) => a.name.localeCompare(b.name));
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:p-6 min-h-0">
        <div className={`text-center ${config.bgSecondary} backdrop-blur-xl rounded-2xl p-8 border ${config.border} shadow-2xl w-full max-w-lg transform transition-all duration-500`}>
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6 mx-auto">
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-xl opacity-60 animate-pulse`}></div>
            <div className={`relative ${config.bg} rounded-full p-3 border ${config.border}`}>
              <HistoryIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${config.text} mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>No Saved Sessions</h2>
          <p className={`${config.textSecondary} mb-6 text-lg`}>Your design history will appear here.</p>
          <button className={`px-6 py-3 rounded-xl font-semibold transition-all ${config.gradient} text-white`}>
            Start Designing
          </button>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const handleDelete = async (chatId: string) => {
    setIsDeleting(chatId);
    await onDelete(chatId);
    setIsDeleting(null);
  };

  return (
    <div className={`flex flex-col h-full ${config.bg} min-h-0`}>
      <header className={`p-4 sm:px-6 border-b ${config.border} sticky top-0 ${config.bg}/90 backdrop-blur-xl z-10`}>
        <h2 className={`text-2xl font-bold ${config.text} mb-2 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Design History</h2>
        <p className={`${config.textSecondary} mb-4 text-sm`}>Manage your saved conversations.</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${config.textSecondary}`} />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl ${config.input} border ${config.border} ${config.text} focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all placeholder-${config.textSecondary} text-base min-h-[44px]`}
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className={`px-4 py-3 rounded-xl ${config.input} border ${config.border} ${config.text} focus:outline-none focus:ring-2 focus:ring-purple-400/30 min-h-[44px]`}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 min-h-0">
        <ul className="space-y-3">
          {sortedChats.map(chat => (
            <li key={chat.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl ${config.bgSecondary} border ${config.border} transition-all backdrop-blur-xl relative overflow-hidden hover:shadow-xl hover:scale-[1.01] cursor-pointer ${premium ? 'ring-1 ring-purple-500/20' : ''}`}>
              {premium && <CrownIcon className="absolute top-2 right-2 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              <button 
                onClick={() => {
                  onLoad(chat.id);
                  if (isMobile) onCloseSidebar();
                }} 
                className="flex-grow text-left overflow-hidden touch-manipulation active:scale-[0.98] w-full sm:w-auto mb-2 sm:mb-0 min-h-[44px] flex items-center"
              >
                <p className={`font-bold ${config.text} truncate text-base`}>{chat.name}</p>
                <p className={`text-xs ${config.textSecondary} mt-1`}>{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => handleDelete(chat.id)}
                className={`self-start sm:self-auto ml-0 sm:ml-4 p-3 flex-shrink-0 rounded-xl ${config.textSecondary} hover:bg-red-900/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 active:scale-95 min-w-[44px] h-[44px] flex items-center justify-center`}
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
          {searchTerm && sortedChats.length === 0 && (
            <li className={`text-center py-12 ${config.textSecondary}`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${config.input} border ${config.border} mx-auto`}>
                <SearchIcon className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="text-base">No designs match "{searchTerm}"</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void; isMobile: boolean; theme: string; premium?: boolean }> = ({ onPromptClick, isMobile, theme, premium }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  const prompts = [
    "Design a minimalist logo for my tech startup",
    "Create a branding strategy for a coffee shop",
    "Generate video thumbnail ideas for YouTube"
  ];
  
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 min-h-0 pt-8 sm:pt-0">
      <div className="text-center w-full max-w-2xl">
        <div className={`inline-block p-6 ${config.bgSecondary} border ${config.border} rounded-2xl mb-6 backdrop-blur-xl shadow-2xl mx-auto relative`}>
          <div className="relative p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-xl animate-pulse mx-auto mb-4">
            <div className={`p-3 ${theme === 'light' ? 'bg-white' : 'bg-zinc-950'} rounded-full`}>
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz" 
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
          </div>
          {premium && <CrownIcon className="absolute top-2 right-2 h-6 w-6 text-yellow-400 animate-bounce" />}
        </div>
        <h1 className={`text-4xl sm:text-5xl font-bold ${config.text} mb-4 tracking-tight animate-in fade-in duration-700 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>Welcome to AJ Studioz</h1>
        <p className={`${config.textSecondary} mb-8 max-w-md mx-auto leading-relaxed text-lg`}>Your AI partner for premium design and branding. Start creating today.</p>
        <div className="space-y-3 mb-8">
          {prompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onPromptClick(prompt)}
              className={`w-full p-4 rounded-xl ${config.bgSecondary} border ${config.border} ${config.text} hover:${config.gradient} hover:text-white transition-all duration-300 text-left shadow-md hover:shadow-xl`}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced loading indicator
const AJLoadingIndicator: React.FC<{ theme: string }> = ({ theme }) => {
  const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl">
          <img 
            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
            alt="AJ Studioz" 
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-ping opacity-50"></div>
      </div>
      <TypingIndicator theme={theme} />
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
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false); // Simulate premium
  const [usageStats, setUsageStats] = useState({ queries: 0, premium: false });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  const currentThemeConfig = themeConfigs[theme] || themeConfigs.dark;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme application
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('saved-chats');
    if (saved) setSavedChats(JSON.parse(saved));
    const savedTheme = localStorage.getItem('hljs-theme') as HighlightTheme;
    if (savedTheme) setHighlightTheme(savedTheme);
    chatSessionRef.current = createChatSession();
    setUsageStats({ queries: 150, premium: true }); // Mock
    setIsPremium(true);
  }, []);

  // Online/offline
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setError(null); };
    const handleOffline = () => { setIsOnline(false); setError('Offline: Local mode active. Reconnect for full AI.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (currentView === 'chat' && !isMobile) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [currentView, isMobile]);

  // HLJS theme
  useEffect(() => {
    const themeUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${highlightTheme}.min.css`;
    const link = document.getElementById('hljs-theme-link') as HTMLLinkElement;
    if (link) link.href = themeUrl;
    localStorage.setItem('hljs-theme', highlightTheme);
  }, [highlightTheme]);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'auto') => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (currentView !== 'chat') return;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    scrollToBottom(isNewMessage ? 'smooth' : 'auto');
    prevMessagesLengthRef.current = messages.length;
  }, [messages, scrollToBottom, currentView]);

  // Body scroll lock for sidebar
  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isSidebarOpen, isMobile]);

  // Google Sign-In (mock)
  const handleGoogleSignIn = async () => {
    // Simulate
    setUser({ name: 'Alex Jordan', email: 'alex@ajstudioz.com', photoUrl: '...' });
  };

  const handleSignOut = () => setUser(null);

  const handleBilling = () => {
    // Open billing modal or redirect
    window.open('https://ajstudioz.com/billing', '_blank');
  };

  // Image upload handler (Grok-like)
  const handleImageUpload = useCallback((file: File) => {
    setUploadedImage(file);
    // In production, upload to server and get analysis
    const reader = new FileReader();
    reader.onload = (e) => {
      setMessages(prev => [...prev, { role: MessageRole.USER, content: `Analyzing image: ${file.name}`, timestamp: Date.now() }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: MessageRole.MODEL, content: `Image analysis: This appears to be a design mockup. Suggestions: Add more contrast.`, timestamp: Date.now() }]);
      }, 1000);
    };
    reader.readAsDataURL(file);
  }, []);

  // Voice input (mock)
  const handleVoiceInput = useCallback(() => {
    // Simulate transcription
    setInput('Voice transcribed text here...');
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSend = useCallback(async (content?: string) => {
    const messageContent = (content || input).trim();
    if (isLoading || !messageContent || (!isPremium && usageStats.queries >= 100)) return setError('Premium required for more queries.');

    if (currentChatId) setCurrentChatId(null);

    const userMessage: Message = { role: MessageRole.USER, content: messageContent, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    setMessages(prev => [...prev, { role: MessageRole.MODEL, content: '', timestamp: Date.now() }]);
    setUsageStats(prev => ({ ...prev, queries: prev.queries + 1 }));

    try {
      if (!chatSessionRef.current) throw new Error("Session error");
      
      const stream = await chatSessionRef.current.sendMessageStream({ 
        message: userMessage.content,
        model: selectedModel as any // Pass model
      });
      
      let streamedText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          streamedText += chunk.text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = streamedText;
            return newMessages;
          });
        }
      }
      setMessages(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], content: streamedText, timestamp: Date.now() }]);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error.';
      setError(`Design error: ${errorMsg}. Please retry.`);
      setMessages(prev => [...prev.slice(0, -1), { role: MessageRole.MODEL, content: `Error: ${errorMsg}. Let's refine your prompt.`, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
      if (!isMobile) inputRef.current?.focus();
    }
  }, [input, isLoading, currentChatId, selectedModel, isPremium, usageStats.queries, isMobile]);

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
    setIsSaveModalOpen(false);
  }, [messages, savedChats]);

  const handleLoadChat = useCallback((chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chat.id);
      chatSessionRef.current = createChatSession(chat.messages);
      setCurrentView('chat');
      if (isMobile) setIsSidebarOpen(false);
    }
  }, [savedChats, isMobile]);

  const handleDeleteChat = useCallback((chatId: string) => {
    if (window.confirm('Delete this session?')) {
      const newChats = savedChats.filter(c => c.id !== chatId);
      setSavedChats(newChats);
      localStorage.setItem('saved-chats', JSON.stringify(newChats));
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
        chatSessionRef.current = createChatSession();
      }
    }
  }, [savedChats, currentChatId]);

  const handleNewChat = useCallback(() => {
    if (messages.length > 0 && !currentChatId) {
      setIsSaveModalOpen(true);
    } else {
      setMessages([]);
      setCurrentChatId(null);
      chatSessionRef.current = createChatSession();
      setCurrentView('chat');
    }
  }, [messages, currentChatId]);

  const handlePromptClick = useCallback((prompt: string) => {
    setInput(prompt);
    handleSend(prompt);
  }, [handleSend]);

  const handleRegenerate = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.slice().reverse().find(m => m.role === MessageRole.USER);
      if (lastUserMessage) handleSend(lastUserMessage.content);
    }
  }, [messages, handleSend]);

  const handleThinkHarder = useCallback(() => {
    // Enhance prompt with "think step by step"
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const enhancedPrompt = `${lastMessage.content} (Think step by step, provide detailed analysis)`;
      handleSend(enhancedPrompt);
    }
  }, [messages, handleSend]);

  const ErrorToast = () => error ? (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-top-2 duration-300 ${currentThemeConfig.bgSecondary} ${currentThemeConfig.text} border ${currentThemeConfig.border} backdrop-blur-xl`}>
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium">{error}</p>
        <button onClick={() => setError(null)} className="ml-auto p-1 text-red-400 hover:text-red-300">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  ) : null;

  const OnlineStatus = () => (
    <div className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-300 backdrop-blur-xl shadow-lg ${isMobile ? 'bottom-20' : 'bottom-4'} ${isOnline ? 'bg-green-900/80 text-green-300 border-green-500/30' : 'bg-red-900/80 text-red-300 border-red-500/30'}`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      {isOnline ? 'Online • Premium Active' : 'Offline'}
    </div>
  );

  // Global Styles (enhanced)
  const GlobalStyles = () => (
    <style jsx global>{`
      :root {
        --bg-primary: ${theme === 'light' ? '#ffffff' : theme === 'z-ai' ? '#0f172a' : theme === 'chatgpt' ? '#111827' : '#09090b'};
        --bg-secondary: ${theme === 'light' ? '#f9fafb' : theme === 'z-ai' ? '#1e293b' : theme === 'chatgpt' ? '#1f2937' : '#18181b'};
        --border-color: ${theme === 'light' ? '#e5e7eb' : theme === 'z-ai' ? '#334155' : theme === 'chatgpt' ? '#374151' : '#27272a'};
        --text-primary: ${theme === 'light' ? '#111827' : '#ffffff'};
        --text-secondary: ${theme === 'light' ? '#6b7280' : '#a1a1aa'};
        --accent-gradient: ${theme === 'z-ai' ? 'linear-gradient(to right, #4f46e5, #06b6d4)' : theme === 'chatgpt' ? 'linear-gradient(to right, #16a34a, #10b981)' : 'linear-gradient(to right, #9333ea, #3b82f6)'};
      }
      
      * { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      
      @keyframes float-glow {
        0% { box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 15px rgba(139,92,246,0.1); transform: translateY(0); }
        100% { box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 25px rgba(139,92,246,0.2), 0 0 40px rgba(59,130,246,0.1); transform: translateY(-2px); }
      }
      .animate-float-glow { animation: float-glow 6s ease-in-out infinite alternate; }
      .animate-float-glow:hover { animation-duration: 3s; }
      
      @media (max-width: 768px) {
        body { overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: none; }
        .chat-container { padding-bottom: 100px; }
      }
      
      button, [role="button"] { min-height: 44px; min-width: 44px; touch-action: manipulation; }
      
      ::-webkit-scrollbar { width: 6px; }
      @media (max-width: 768px) { ::-webkit-scrollbar { width: 0; } }
      ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.6); }
      
      input, textarea { font-size: 16px !important; }
      html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
      
      * { -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
      input, textarea, [contenteditable] { -webkit-user-select: text; user-select: text; }
      
      .line-clamp-6 { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
  );

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <div className={`flex h-screen font-sans transition-all duration-500 ease-in-out overflow-hidden ${currentThemeConfig.bg} ${currentThemeConfig.text}`}>
        {/* Background layers */}
        <div className={`fixed inset-0 ${currentThemeConfig.bg}`}></div>
        <div className="fixed inset-0 opacity-20 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-transparent"></div>
        
        <ErrorToast />
        <OnlineStatus />
        
        {isSaveModalOpen && (
          <SaveChatModal
            onClose={() => setIsSaveModalOpen(false)}
            onSave={handleSaveChat}
            onDiscard={() => {
              setMessages([]);
              setCurrentChatId(null);
              chatSessionRef.current = createChatSession();
              setIsSaveModalOpen(false);
            }}
            theme={theme}
          />
        )}
        
        {isSidebarOpen && isMobile && (
          <div 
            className={`fixed inset-0 ${currentThemeConfig.bg}/70 z-30 backdrop-blur-xl`}
            onClick={toggleSidebar}
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
          onBilling={handleBilling}
          usageStats={usageStats}
        />
        
        <div className="flex flex-col flex-grow h-screen relative z-10">
          {/* Mobile Header */}
          <header className={`flex items-center justify-between p-4 border-b md:hidden sticky top-0 backdrop-blur-xl z-20 transition-all duration-500 ${currentThemeConfig.bg}/95 ${currentThemeConfig.border}`}>
            <button onClick={toggleSidebar} className={`p-3 rounded-xl transition-all touch-manipulation active:scale-[0.95] ${currentThemeConfig.text} ${currentThemeConfig.hover} min-w-[44px] h-[44px]`}>
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${currentThemeConfig.bgSecondary}`}>
                <AJStudiozIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-wide ${currentThemeConfig.text}">AJ STUDIOZ</h1>
            </div>
            <div className="w-6" />
          </header>

          {/* Main Content */}
          <main ref={chatContainerRef} className="chat-container flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 flex flex-col relative z-10 transition-all duration-300">
            {currentView === 'chat' ? (
              messages.length === 0 ? (
                <ChatWelcome onPromptClick={handlePromptClick} isMobile={isMobile} theme={theme} premium={isPremium} />
              ) : (
                <div className="max-w-4xl mx-auto w-full pt-6 space-y-0">
                  {messages.map((msg, index) => {
                    const isTyping = isLoading && index === messages.length - 1 && msg.role === MessageRole.MODEL && !msg.content;
                    if (isTyping) return <TypingIndicator key="typing" theme={theme} />;

                    return (
                      <ChatMessage
                        key={`${msg.role}-${index}-${msg.timestamp}`}
                        message={msg}
                        isLoading={isLoading}
                        isLastMessage={index === messages.length - 1}
                        theme={theme}
                        onRegenerate={handleRegenerate}
                        onThinkHarder={handleThinkHarder}
                      />
                    );
                  })}
                  {isLoading && <AJLoadingIndicator theme={theme} />}
                </div>
              )
            ) : currentView === 'explore' ? (
              <ExploreView isMobile={isMobile} theme={theme} premium={isPremium} />
            ) : currentView === 'history' ? (
              <HistoryView 
                chats={savedChats}
                onLoad={handleLoadChat}
                onDelete={handleDeleteChat}
                onCloseSidebar={toggleSidebar}
                isMobile={isMobile}
                theme={theme}
                premium={isPremium}
              />
            ) : currentView === 'analytics' ? (
              <AnalyticsView theme={theme} isMobile={isMobile} />
            ) : null}
          </main>
        </div>

        {/* Chat Input */}
        {currentView === 'chat' && (
          <ChatInput 
            ref={inputRef} 
            value={input} 
            onChange={setInput} 
            onSend={() => handleSend()} 
            isLoading={isLoading} 
            theme={theme}
            onImageUpload={handleImageUpload}
            onVoiceInput={handleVoiceInput}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
