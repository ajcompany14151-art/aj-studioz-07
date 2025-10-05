
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Message, MessageRole, HighlightTheme, Theme, AppView } from './types';
import { createChatSession } from './services/geminiService';
import type { Chat } from '@google/genai';
import { MenuIcon } from './components/icons/MenuIcon';
import { AJStudiozIcon } from './components/icons/AJStudiozIcon';
import { SearchIcon } from './components/icons/SearchIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';

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

// Placeholder for Chat History view
const HistoryView: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <HistoryIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Chat History</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">This feature is coming soon.</p>
    </div>
  </div>
);

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

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [highlightTheme, setHighlightTheme] = useState<HighlightTheme>('atom-one-dark');
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    // Set theme from localStorage or system preference
    const savedAppTheme = localStorage.getItem('app-theme') as Theme;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedAppTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    const savedTheme = localStorage.getItem('hljs-theme') as HighlightTheme;
    if (savedTheme) {
      setHighlightTheme(savedTheme);
    }
    chatSessionRef.current = createChatSession();
    inputRef.current?.focus();
  }, []);

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
  }, [input, isLoading]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    chatSessionRef.current = createChatSession();
  }, []);

  const handlePromptClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  return (
    <div className="flex h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 ease-in-out">
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
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg}
                    isLoading={isLoading}
                    isLastMessage={index === messages.length - 1}
                  />
                ))}
              </div>
            )
          ) : currentView === 'explore' ? (
            <ExploreView />
          ) : (
            <HistoryView />
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