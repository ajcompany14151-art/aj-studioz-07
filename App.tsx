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
    <div className="text-center max-w-md bg-black/90 backdrop-blur-xl rounded-3xl p-8 border border-zinc-700/30 shadow-2xl shadow-black/50 animate-float-glow">
      <SearchIcon className="mx-auto h-12 w-12 text-purple-400 mb-4 animate-pulse" />
      <h2 className="text-xl font-bold text-white mb-2">Explore</h2>
      <p className="text-zinc-400">Discover prompts, templates, and more. Coming soon with advanced search.</p>
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
        <div className="text-center bg-black/90 backdrop-blur-xl rounded-3xl p-8 border border-zinc-700/30 shadow-2xl shadow-black/50 animate-float-glow">
          <HistoryIcon className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h2 className="text-xl font-bold text-white">No Saved Chats</h2>
          <p className="text-zinc-400 mt-1 max-w-xs mx-auto">Start a conversation and create a new chat to save it here for later.</p>
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
    <div className="flex flex-col h-full bg-black">
      <header className="p-4 md:px-10 border-b border-zinc-700/30 sticky top-0 bg-black/90 backdrop-blur-xl z-10">
        <h2 className="text-xl font-bold text-white mb-2">Chat History</h2>
        <p className="text-zinc-400 mb-4">Load or delete your saved conversations.</p>
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/70 border border-zinc-700/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all placeholder-zinc-500"
          />
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 md:p-10">
        <ul className="space-y-3">
          {filteredChats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className="group flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-zinc-700/30 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl">
              <button 
                onClick={() => { onLoad(chat.id); onCloseSidebar(); }} 
                className="flex-grow text-left overflow-hidden touch-manipulation active:scale-[0.98]"
                aria-label={`Load chat: ${chat.name}`}
              >
                <p className="font-bold text-white truncate">{chat.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => onDelete(chat.id)}
                aria-label={`Delete chat: ${chat.name}`}
                title="Delete chat"
                className="ml-4 p-2 flex-shrink-0 rounded-xl text-zinc-500 hover:bg-red-900/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 active:scale-95"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
          {searchTerm && filteredChats.length === 0 && (
            <li className="text-center py-8 text-zinc-400">No chats found.</li>
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
  <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
    {SUGGESTED_PROMPTS.map(({ title, prompt }) => (
      <button
        key={title}
        onClick={() => onPromptClick(prompt)}
        className="p-6 bg-black/70 border border-zinc-700/30 rounded-2xl text-left hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all backdrop-blur-xl touch-manipulation active:scale-[0.98] animate-float-glow"
      >
        <p className="font-bold text-white text-sm mb-2">{title}</p>
        <p className="text-zinc-400 leading-relaxed">{prompt}</p>
      </button>
    ))}
  </div>
);

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
    <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
            <div className="inline-block p-6 bg-black/90 border border-zinc-700/30 rounded-3xl mb-6 backdrop-blur-xl shadow-2xl shadow-black/50 animate-float-glow">
                <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
                    <div className="p-2 bg-black rounded-full">
                        <img 
                            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                            alt="AJ Studioz Logo" 
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight animate-in fade-in duration-500">How can I help you today?</h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Try one of these prompts to get started.</p>
            <SuggestedPrompts onPromptClick={onPromptClick} />
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

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Effect to lock premium dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark', 'premium-dark');
    localStorage.setItem('app-theme', 'dark');
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

  // Prevent body scroll when sidebar open on mobile
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
    <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-top-2 duration-300 bg-red-900/90 text-white border border-red-700/50 backdrop-blur-xl animate-float-glow">
      {error}
      <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  // Global floating glow animation
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
    `}</style>
  );

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <div className="flex h-screen font-sans transition-all duration-500 ease-in-out overflow-hidden bg-black text-white">
        {/* Grok-clone premium dark mode background effects */}
        <div className="fixed inset-0 bg-black"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent"></div>
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="fixed inset-0 opacity-10" style={{ backgroundImage: `url('${patternUrl}')` }}></div>
        
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
        />
        <div className="flex flex-col flex-grow h-screen relative">
          <header className="flex items-center justify-between p-3 border-b md:hidden sticky top-0 backdrop-blur-2xl z-10 transition-all duration-500 bg-black/95 border-zinc-700/30">
              <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-2xl transition-all touch-manipulation active:scale-[0.95] text-white hover:bg-zinc-900/50">
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

          <main ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 md:px-10 flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-zinc-700">
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
                              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700/30 flex items-center justify-center backdrop-blur-xl bg-black/50 animate-float-glow">
                                  <AJStudiozIcon className="h-5 w-5 text-white"/>
                              </div>
                              <div className="flex items-center gap-2 pt-1.5">
                                  <SpinnerIcon className="h-5 w-5 animate-spin text-purple-400" />
                                  <span className="text-sm font-medium text-white">AJ is thinking...</span>
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
              <footer className="w-full border-t transition-all duration-500 relative z-10 bg-black/95 border-zinc-700/30 backdrop-blur-2xl">
                <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} />
              </footer>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
