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
import { CrownIcon } from './components/icons/CrownIcon';

// Placeholder for Explore view
const ExploreView: React.FC = () => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="text-center max-w-md">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full text-purple-700 dark:text-purple-300 mb-6 shadow-lg shadow-purple-500/20">
        <CrownIcon className="h-5 w-5" />
        <SearchIcon className="h-5 w-5" />
        <span className="font-semibold">Premium Explore</span>
      </div>
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Discover Premium Features</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">Advanced AI tools, enhanced creativity, and exclusive content coming soon.</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          AI-Powered Insights
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
          Custom Workflows
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-600"></div>
          Pro Templates
        </div>
      </div>
    </div>
  </div>
);

// Functional Chat History view
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
  theme: Theme;
}> = ({ chats, onLoad, onDelete, onCloseSidebar, theme }) => {
  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-100/50 to-zinc-50/50 dark:from-zinc-900/50 dark:to-zinc-800/50 rounded-full text-zinc-600 dark:text-zinc-400 mb-6 shadow-md">
            <HistoryIcon className="h-5 w-5" />
            <span className="font-semibold">Chat History</span>
          </div>
          <HistoryIcon className="mx-auto h-16 w-16 text-zinc-400 dark:text-zinc-600 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">No Saved Chats Yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">Start a brilliant conversation and save it here for instant recall anytime.</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <header className={`p-4 md:px-10 border-b backdrop-blur-md ${
        theme === 'dark' ? 'bg-black/50 border-zinc-800/50 shadow-lg shadow-black/20' : 'bg-white/80 border-zinc-200/50 shadow-md shadow-zinc-200/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <HistoryIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Premium Chat History</h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Load, enhance, or archive your saved conversations with ease.</p>
      </header>
      <div className="flex-grow overflow-y-auto p-4 md:p-10">
        <ul className="space-y-3">
          {chats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className={`group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-950/50 dark:to-black/50 border border-zinc-200/40 dark:border-zinc-700/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-400/30`}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <button 
                onClick={() => { onLoad(chat.id); onCloseSidebar(); }} 
                className="relative z-10 flex-grow text-left overflow-hidden"
                aria-label={`Load premium chat: ${chat.name}`}
              >
                <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{chat.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => onDelete(chat.id)}
                aria-label={`Archive chat: ${chat.name}`}
                title="Archive chat"
                className="relative z-10 ml-4 p-3 flex-shrink-0 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-red-100/50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm hover:shadow-md hover:shadow-red-200/30 dark:hover:shadow-red-800/30"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SUGGESTED_PROMPTS = [
  { title: "Master a Concept", prompt: "Break down quantum entanglement like I'm a curious 10-year-old genius." },
  { title: "Code Wizardry", prompt: "Architect a sleek React component for dynamic AI chat with hooks and TypeScript." },
  { title: "Pro Email Craft", prompt: "Compose an elegant, persuasive email to secure a high-stakes partnership deal." },
  { title: "Idea Ignition", prompt: "Unleash 7 revolutionary concepts for AI-driven sustainable urban futures." },
];

const SuggestedPrompts: React.FC<{ onPromptClick: (prompt: string) => void; theme: Theme }> = ({ onPromptClick, theme }) => (
  <div className="max-w-4xl mx-auto w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {SUGGESTED_PROMPTS.map(({ title, prompt }) => (
        <button
          key={title}
          onClick={() => onPromptClick(prompt)}
          className={`group relative overflow-hidden p-6 bg-gradient-to-br from-zinc-50/70 to-white/70 dark:from-zinc-950/70 dark:to-black/70 border border-zinc-200/40 dark:border-zinc-700/40 rounded-2xl text-left transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/5 before:to-blue-500/5 before:opacity-0 before:transition-all before:group-hover:opacity-100`}
        >
          <div className="relative z-10">
            <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{title}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{prompt}</p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <SparklesIcon className="h-4 w-4 text-purple-500 animate-pulse" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void; theme: Theme }> = ({ onPromptClick, theme }) => (
    <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-4 max-w-2xl mx-auto">
            <div className={`inline-block p-6 bg-gradient-to-br from-purple-50/70 to-blue-50/70 dark:from-purple-950/70 dark:to-blue-950/70 border border-purple-200/50 dark:border-purple-800/50 rounded-3xl mb-8 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 backdrop-blur-md transition-all duration-700 hover:scale-105 hover:shadow-purple-500/20 dark:hover:shadow-purple-500/30`}>
                <AJStudiozIcon className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-spin-slow"/>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-purple-600 via-blue-600 to-purple-600 dark:from-purple-400 dark:via-blue-400 dark:to-purple-400">Ignite Your Genius</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">Premium AI companionship for extraordinary minds. Let's create something legendary.</p>
            <div className="mt-8">
                <SuggestedPrompts onPromptClick={onPromptClick} theme={theme} />
            </div>
        </div>
    </div>
);

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('app-theme');
    if (storedPrefs === 'light' || storedPrefs === 'dark') {
      return storedPrefs;
    }
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'dark'; // Default to premium dark theme
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [highlightTheme, setHighlightTheme] = useState<HighlightTheme>('dracula');
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Effect to manage theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('premium-dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('premium-dark');
    }
    localStorage.setItem('app-theme', theme);
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

  // Effect to focus chat input when the chat view becomes active
  useEffect(() => {
    if (currentView === 'chat') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = useCallback(async (content?: string) => {
    const messageContent = (content || input).trim();
    if (isLoading || !messageContent) return;

    // When user sends a message in a saved chat, it's now a new "unsaved" version.
    if (currentChatId) {
        setCurrentChatId(null);
    }

    const userMessage: Message = { role: MessageRole.USER, content: messageContent };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: MessageRole.MODEL, content: '' }]);

    try {
      if (!chatSessionRef.current) {
        throw new Error("Chat session not initialized");
      }
      
      const stream = await chatSessionRef.current.sendMessageStream({ message: userMessage.content });
      
      let streamedText = '';
      for await (const chunk of stream) {
        streamedText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: MessageRole.MODEL, content: streamedText };
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: MessageRole.MODEL, content: `Apologies, a cosmic glitch occurred: ${errorMessage}. Let's recalibrate and try again.` };
          return newMessages;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, currentChatId]);

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
    if (window.confirm('Are you certain? This premium chat will vanish into the void forever.')) {
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

  // Twinkle stars pattern (moved to style prop to avoid esbuild colon parsing issue)
  const twinklePattern = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="50" cy="50" r="1"/%3E%3C/g%3E%3C/svg%3E';

  return (
    <div className={`flex h-screen font-sans transition-all duration-700 ease-out ${
      theme === 'dark' 
        ? 'bg-black text-zinc-100' 
        : 'bg-gradient-to-br from-white via-zinc-50 to-white text-zinc-900'
    }`}>
      {/* Premium dark mode cosmic background */}
      {theme === 'dark' && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black opacity-95"></div>
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent animate-pulse"></div>
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent animate-pulse delay-2000"></div>
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-float delay-1000"></div>
          <div className="fixed inset-0 opacity-10" style={{ backgroundImage: `url('${patternUrl}')` }}></div>
          <div className="fixed inset-0 opacity-5 animate-twinkle" style={{ backgroundImage: `url('${twinklePattern}')` }}></div>
        </>
      )}
      
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
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-2xl"
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
      />
      <div className="flex flex-col flex-grow h-screen relative">
        <header className={`flex items-center justify-between p-4 border-b md:hidden sticky top-0 backdrop-blur-2xl z-20 transition-all duration-700 ${
          theme === 'dark'
            ? 'bg-black/90 border-zinc-800/30 text-zinc-100 shadow-2xl shadow-black/40'
            : 'bg-white/90 border-zinc-200/30 text-zinc-900 shadow-xl shadow-zinc-200/30'
        }`}>
            <button onClick={toggleSidebar} className={`group p-3 -ml-2 rounded-xl transition-all duration-500 relative overflow-hidden ${
              theme === 'dark' 
                ? 'text-zinc-100 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-purple-500/20' 
                : 'text-zinc-800 hover:bg-zinc-100 hover:shadow-md hover:shadow-zinc-200/20'
            } before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:opacity-0 before:transition-all before:group-hover:opacity-100`}>
              <MenuIcon className="h-6 w-6 relative z-10" />
            </button>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl relative overflow-hidden ${
                  theme === 'dark' ? 'bg-zinc-900/50 shadow-lg shadow-black/20' : 'bg-zinc-100 shadow-md shadow-zinc-200/20'
                } before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/10 before:to-blue-500/10 before:opacity-50`}>
                  <AJStudiozIcon className={`h-6 w-6 relative z-10 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}/>
                </div>
                <h1 className="text-lg font-black tracking-wide bg-gradient-to-r bg-clip-text text-transparent from-purple-600 via-blue-600 to-purple-600">AJ STUDIOZ</h1>
            </div>
            <div className="w-8"></div>
        </header>

        <main ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 md:px-10 flex flex-col relative z-10">
          {currentView === 'chat' ? (
            messages.length === 0 ? (
              <ChatWelcome onPromptClick={handlePromptClick} theme={theme} />
            ) : (
              <div className="max-w-4xl mx-auto w-full pt-6">
                {messages.map((msg, index) => {
                  const isTypingPlaceholder = isLoading && index === messages.length - 1 && msg.role === MessageRole.MODEL && msg.content === '';
                  if (isTypingPlaceholder) return null;

                  return (
                    <ChatMessage
                      key={index}
                      message={msg}
                      isLoading={isLoading}
                      isLastMessage={index === messages.length - 1}
                    />
                  );
                })}

                {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                    <div className="py-6 px-2 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg backdrop-blur-md ${
                              theme === 'dark'
                                ? 'bg-zinc-900/70 border-zinc-700/50 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-purple-500/20 before:to-blue-500/20 before:animate-pulse'
                                : 'bg-gradient-to-br from-zinc-200/70 to-zinc-100/70 border-zinc-300/50 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-purple-500/10 before:to-blue-500/10 before:animate-pulse'
                            }`}>
                                <AJStudiozIcon className={`h-5 w-5 relative z-10 ${
                                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
                                }`}/>
                            </div>
                            <div className="flex items-center gap-3 pt-2 bg-gradient-to-r from-purple-50/70 to-blue-50/70 dark:from-purple-950/70 dark:to-blue-950/70 rounded-2xl px-4 py-3 border border-purple-200/50 dark:border-purple-800/50 shadow-md backdrop-blur-md">
                                <SpinnerIcon className={`h-5 w-5 animate-spin relative z-10 ${
                                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                }`} />
                                <span className={`text-sm font-semibold relative z-10 ${
                                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                }`}>AJ is weaving magic...</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent relative z-10"></div>
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
              theme={theme}
            />
          )}
        </main>
        {currentView === 'chat' && (
            <footer className={`w-full border-t transition-all duration-700 relative z-20 backdrop-blur-2xl ${
              theme === 'dark'
                ? 'bg-black/95 border-zinc-800/30 shadow-2xl shadow-black/40'
                : 'bg-white/95 border-zinc-200/30 shadow-xl shadow-zinc-200/30'
            }`}>
              <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} />
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;
