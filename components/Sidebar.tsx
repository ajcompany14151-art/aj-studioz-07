
import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { UserIcon } from './icons/UserIcon';
import { HighlightTheme, Theme, AppView } from '../types';
import { PaletteIcon } from './icons/PaletteIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highlightTheme: HighlightTheme;
  setHighlightTheme: (theme: HighlightTheme) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-zinc-200 dark:bg-zinc-950 text-zinc-900 dark:text-white'
        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);


const themes: { id: HighlightTheme; name: string }[] = [
    { id: 'atom-one-dark', name: 'Atom One Dark' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'nord', name: 'Nord' },
];

const UserProfileSection: React.FC = () => {
    const [userName, setUserName] = useState('Alex Jordan');
    const [userEmail, setUserEmail] = useState('alex.jordan@ajstudioz.com');
    const [isEditing, setIsEditing] = useState(false);
    
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);
  
    const handleEdit = () => {
      setEditName(userName);
      setEditEmail(userEmail);
      setIsEditing(true);
    };
  
    const handleCancel = () => {
      setIsEditing(false);
    };
  
    const handleSave = () => {
      setUserName(editName);
      setUserEmail(editEmail);
      setIsEditing(false);
    };

    return (
        <div className="p-2">
            {isEditing ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-300 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <div className="flex-grow space-y-1">
                             <input 
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-zinc-200/50 dark:bg-zinc-950 rounded-md p-1 -m-1 text-sm font-semibold border-none focus:ring-1 focus:ring-zinc-500 text-zinc-900 dark:text-white"
                                aria-label="User name"
                            />
                             <input 
                                type="email" 
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-zinc-200/50 dark:bg-zinc-950 rounded-md p-1 -m-1 text-xs border-none focus:ring-1 focus:ring-zinc-500 text-zinc-500 dark:text-zinc-400"
                                aria-label="User email"
                            />
                        </div>
                    </div>
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={handleCancel} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                            <XIcon className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                        </button>
                        <button onClick={handleSave} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
                            <CheckIcon className="h-3.5 w-3.5" />
                            <span>Save</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-950 transition-colors">
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-300 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleEdit} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        aria-label="Edit Profile"
                        title="Edit Profile"
                    >
                        <SettingsIcon className="h-5 w-5"/>
                    </button>
                </div>
            )}
        </div>
    );
}


const SidebarComponent: React.FC<SidebarProps> = ({ onNewChat, isOpen, onClose, theme, setTheme, highlightTheme, setHighlightTheme, currentView, onViewChange }) => {
  useEffect(() => {
    // Apply theme class to the document root and persist preference
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);
  
  const handleNewChatClick = () => {
    onNewChat();
    onViewChange('chat');
    onClose(); // Close sidebar on mobile after starting new chat
  };
  
  return (
    <aside className={`
      bg-zinc-50 dark:bg-black p-4 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 
      transform transition-transform transition-colors duration-300 ease-in-out
      fixed w-72 top-0 left-0 z-40 
      md:flex md:static md:w-72 md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <AJStudiozIcon className="h-6 w-6 text-zinc-900 dark:text-white"/>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-wide">AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white md:hidden transition-colors">
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className="flex items-center justify-between w-full gap-3 p-3 mb-4 rounded-lg text-sm font-medium text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-950 hover:bg-zinc-300/70 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 transition-colors"
      >
        <span>New Chat</span>
        <PlusIcon className="h-4 w-4" />
      </button>

      <nav className="flex-grow space-y-2">
        <SidebarNavItem 
            icon={<SearchIcon className="h-5 w-5" />} 
            label="Explore" 
            onClick={() => onViewChange('explore')}
            isActive={currentView === 'explore'}
        />
        <SidebarNavItem 
            icon={<HistoryIcon className="h-5 w-5" />} 
            label="Chat History" 
            onClick={() => onViewChange('history')}
            isActive={currentView === 'history'}
        />
      </nav>

      <div className="mt-auto pt-4 space-y-4">
        <div className="flex items-center justify-between px-3 py-1">
            <span className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {theme === 'dark' 
                    ? <MoonIcon className="h-5 w-5" /> 
                    : <SunIcon className="h-5 w-5" />
                }
                <span>{theme.charAt(0).toUpperCase() + theme.slice(1)} Mode</span>
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-black
                  ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-300'}
                `}
            >
                <span className="sr-only">Use {theme === 'dark' ? 'light' : 'dark'} theme</span>
                <span
                    aria-hidden="true"
                    className={`${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>

        <div>
          <label htmlFor="theme-select" className="text-xs font-semibold text-zinc-500 px-3">CODE THEME</label>
          <div className="relative mt-1">
            <PaletteIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 dark:text-zinc-400 pointer-events-none" />
            <select
              id="theme-select"
              value={highlightTheme}
              onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
              className="w-full appearance-none bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 pl-10 text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-700 cursor-pointer"
              aria-label="Select code block theme"
            >
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" />
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-800">
            <UserProfileSection />
        </div>
      </div>
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent);