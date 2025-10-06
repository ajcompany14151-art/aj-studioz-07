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
import { ErrorBoundary } from './components/ErrorBoundary'; // Assume added for stability

// Placeholder for Explore view with enhancement
const ExploreView: React.FC = () => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="text-center max-w-md">
      <SearchIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4 animate-bounce" />
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Explore</h2>
      <p className="text-zinc-500 dark:text-zinc-400">Discover prompts, templates, and more. Coming soon with advanced search.</p>
    </div>
  </div>
);

// Functional Chat History view with search enhancement
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
}> = ({ chats, onLoad, onDelete, onCloseSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <HistoryIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">No Saved Chats</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">Start a conversation and create a new chat to save it here for later.</p>
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
      <header className="p-4 md:px-10 border-b border-zinc-200 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Chat History</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Load or delete your saved conversations.</p>
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-black/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
          />
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 md:p-10">
        <ul className="space-y-3">
          {filteredChats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className="group flex items-center justify-between p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-900/50 transition-all hover:shadow-md hover:border-zinc-300/50 dark:hover:border-zinc-800/50 backdrop-blur-sm">
              <button 
                onClick={() => { onLoad(chat.id); onCloseSidebar(); }} 
                className="flex-grow text-left overflow-hidden touch-manipulation active:scale-[0.98]"
                aria-label={`Load chat: ${chat.name}`}
              >
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{chat.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => onDelete(chat.id)}
                aria-label={`Delete chat: ${chat.name}`}
                title="Delete chat"
                className="ml-4 p-2 flex-shrink-0 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 active:scale-95"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
          {searchTerm && filteredChats.length === 0 && (
            <li className="text-center py-8 text-zinc-500 dark:text-zinc-400">No chats found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const SUGGESTED_PROMPTS = [
  { title: "Explain a concept", prompt: "Explain quantum computing in simple terms." },
  { title: "Write some code", prompt: "Write a python script that scrapes the headlines from a news website." },
  { title: "Draft an email", prompt: "Draft a professional email to a client apologizing for a project delay." },
  { title: "Brainstorm ideas", prompt: "Give me 5 creative ideas for a new tech startup in the AI space." },
];

const SuggestedPrompts: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
  <div className="max-w-4xl mx-auto w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {SUGGESTED_PROMPTS.map(({ title, prompt }) => (
        <button
          key={title}
          onClick={() => onPromptClick(prompt)}
          className="p-6 bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-900/50 rounded-2xl text-left hover:bg-zinc-200/80 dark:hover:bg-zinc-900/80 transition-all hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50 backdrop-blur-sm touch-manipulation active:scale-[0.98]"
        >
          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-2">{title}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{prompt}</p>
        </button>
      ))}
    </div>
  </div>
);

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
    <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
            <div className="inline-block p-4 bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-900/50 rounded-2xl mb-6 backdrop-blur-sm shadow-lg shadow-zinc-200/30 dark:shadow-zinc-800/30">
                <div className="relative p-0.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
                    <div className="p-1.5 bg-white dark:bg-black rounded-full">
                        <img 
                            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                            alt="AJ Studioz Logo" 
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight animate-in fade-in duration-500">How can I help you today?</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">Try one of these prompts to get started.</p>
            <div className="mt-8">
                <SuggestedPrompts onPromptClick={onPromptClick} />
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
  return 'light'; // Default to light theme
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [highlightTheme, setHighlightTheme] = useState<HighlightTheme>('atom-one-dark');
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Enhancement: Global error state

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

  // Enhancement: Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setError(null);
    const handleOffline = () => setError('You are offline. Some features may be limited.');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Effect to focus chat input when the chat view becomes active
  useEffect(() => {
    if (currentView === 'chat') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Increased delay for mobile
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

  // Enhancement: Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

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
      setError(`Failed to send message: ${errorMessage}`);
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: MessageRole.MODEL, content: `Sorry, I encountered an error: ${errorMessage}. Please try again.` };
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
    if (window.confirm('Are you sure you want to delete this chat history? This action cannot be undone.')) {
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

  // Enhancement: Error toast
  const ErrorToast = () => error ? (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm w-full mx-4 animate-in slide-in-from-top-2 duration-300 ${
      theme === 'dark' ? 'bg-red-900/80 text-white border border-red-700/50' : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {error}
      <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-opacity-20">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  return (
    <ErrorBoundary> {/* Enhancement: Error boundary for stability */}
      <div className={`flex h-screen font-sans transition-all duration-500 ease-in-out overflow-hidden ${
        theme === 'dark' 
          ? 'bg-black text-white' 
          : 'bg-gradient-to-br from-white via-zinc-50 to-white text-zinc-900'
      }`}>
        {/* Grok-style premium dark mode background effects */}
        {theme === 'dark' && (
          <>
            <div className="fixed inset-0 bg-black"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="fixed inset-0 opacity-20" style={{ backgroundImage: `url('${patternUrl}')` }}></div>
          </>
        )}
        
        <ErrorToast />
        
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
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
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
          <header className={`flex items-center justify-between p-3 border-b md:hidden sticky top-0 backdrop-blur-xl z-10 transition-all duration-500 ${
            theme === 'dark'
              ? 'bg-black/80 border-zinc-800/50 text-white shadow-lg shadow-black/30'
              : 'bg-white/80 border-zinc-200/50 text-zinc-900 shadow-lg shadow-zinc-200/20'
          }`}>
              <button onClick={toggleSidebar} className={`p-2 -ml-2 rounded-lg transition-all touch-manipulation active:scale-[0.95] ${
                theme === 'dark' 
                  ? 'text-white hover:bg-zinc-800/50' 
                  : 'text-zinc-800 hover:bg-zinc-100'
              }`}>
                <MenuIcon className="h-6 w-6"/>
              </button>
              <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-900/50' : 'bg-zinc-100'
                  }`}>
                    <AJStudiozIcon className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-white' : 'text-zinc-900'
                    }`}/>
                  </div>
                  <h1 className="text-base font-semibold tracking-wide">AJ STUDIOZ</h1>
              </div>
              <div className="w-6"></div>
          </header>

          <main ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 md:px-10 flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            {currentView === 'chat' ? (
              messages.length === 0 ? (
                <ChatWelcome onPromptClick={handlePromptClick} />
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
                      />
                    );
                  })}

                  {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                      <div className="py-6 px-2">
                          <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center backdrop-blur-sm ${
                                theme === 'dark'
                                  ? 'bg-zinc-900/50 border-zinc-700/50'
                                  : 'bg-gradient-to-br from-zinc-200 to-zinc-100 border-zinc-300'
                              }`}>
                                  <AJStudiozIcon className={`h-5 w-5 ${
                                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
                                  }`}/>
                              </div>
                              <div className="flex items-center gap-2 pt-1.5">
                                  <SpinnerIcon className={`h-5 w-5 animate-spin ${
                                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                  }`}>AJ is thinking...</span>
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
              />
            )}
          </main>
          {currentView === 'chat' && (
              <footer className={`w-full border-t transition-all duration-500 relative z-10 ${
                theme === 'dark'
                  ? 'bg-zinc-900/90 border-zinc-700/50 backdrop-blur-xl shadow-lg shadow-black/30'
                  : 'bg-white/90 border-zinc-200/50 backdrop-blur-xl shadow-lg shadow-zinc-200/20'
              }`}>
                <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} />
              </footer>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
