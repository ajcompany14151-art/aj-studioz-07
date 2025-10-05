




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

// Placeholder for Explore view
const ExploreView: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <SearchIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Explore</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">This feature is coming soon.</p>
    </div>
  </div>
);

// Functional Chat History view
const HistoryView: React.FC<{ 
  chats: SavedChat[]; 
  onLoad: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onCloseSidebar: () => void;
}> = ({ chats, onLoad, onDelete, onCloseSidebar }) => {
  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
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
      <header className="p-4 md:px-10 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Chat History</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Load or delete your saved conversations.</p>
      </header>
      <div className="flex-grow overflow-y-auto p-4 md:p-10">
        <ul className="space-y-3">
          {chats.sort((a, b) => b.timestamp - a.timestamp).map(chat => (
            <li key={chat.id} className="group flex items-center justify-between p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-800">
              <button 
                onClick={() => { onLoad(chat.id); onCloseSidebar(); }} 
                className="flex-grow text-left overflow-hidden"
                aria-label={`Load chat: ${chat.name}`}
              >
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{chat.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatTimestamp(chat.timestamp)}</p>
              </button>
              <button
                onClick={() => onDelete(chat.id)}
                aria-label={`Delete chat: ${chat.name}`}
                title="Delete chat"
                className="ml-4 p-2 flex-shrink-0 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
  { title: "Explain a concept", prompt: "Explain quantum computing in simple terms." },
  { title: "Write some code", prompt: "Write a python script that scrapes the headlines from a news website." },
  { title: "Draft an email", prompt: "Draft a professional email to a client apologizing for a project delay." },
  { title: "Brainstorm ideas", prompt: "Give me 5 creative ideas for a new tech startup in the AI space." },
];

const SuggestedPrompts: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
  <div className="max-w-4xl mx-auto w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {SUGGESTED_PROMPTS.map(({ title, prompt }) => (
        <button
          key={title}
          onClick={() => onPromptClick(prompt)}
          className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl text-left hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
        >
          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{title}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{prompt}</p>
        </button>
      ))}
    </div>
  </div>
);

const ChatWelcome: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
    <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-4">
            <div className="inline-block p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl mb-6">
                <AJStudiozIcon className="h-10 w-10 text-zinc-900 dark:text-white"/>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">How can I help you today?</h1>
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

  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Effect to manage theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      }, 50);
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

  return (
    <div className="flex h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 ease-in-out">
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
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
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
      <div className="flex flex-col flex-grow h-screen">
        <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-900 md:hidden sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 transition-colors duration-300 ease-in-out">
            <button onClick={toggleSidebar} className="text-zinc-800 dark:text-white p-2 -ml-2">
              <MenuIcon className="h-6 w-6"/>
            </button>
            <div className="flex items-center gap-2">
                <AJStudiozIcon className="h-5 w-5 text-zinc-900 dark:text-white"/>
                <h1 className="text-base font-semibold text-zinc-900 dark:text-white tracking-wide">AJ STUDIOZ</h1>
            </div>
            <div className="w-6"></div>
        </header>

        <main ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 md:px-10 flex flex-col">
          {currentView === 'chat' ? (
            messages.length === 0 ? (
              <ChatWelcome onPromptClick={handlePromptClick} />
            ) : (
              <div className="max-w-4xl mx-auto w-full pt-4">
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
                    <div className="py-6 px-2">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 flex items-center justify-center">
                                <AJStudiozIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300"/>
                            </div>
                            <div className="flex items-center gap-2 pt-1.5">
                                <SpinnerIcon className="h-5 w-5 animate-spin text-zinc-500 dark:text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">AJ is thinking...</span>
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
            <footer className="w-full border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black transition-colors duration-300 ease-in-out">
              <ChatInput ref={inputRef} value={input} onChange={setInput} onSend={() => handleSend()} isLoading={isLoading} />
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;