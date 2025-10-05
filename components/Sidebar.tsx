import React, { useState } from 'react'
import { PlusIcon } from './icons/PlusIcon';
import { AJStudiozIcon } from './icons/AJStudiozIcon';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { UserIcon } from './icons/UserIcon';
import { HighlightTheme, Theme, AppView } from '../types';
import { PaletteIcon } from './icons/PaletteIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SunIcon } from './icons/SunIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

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
        ? 'bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-white'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);


const themes: { id: HighlightTheme; name: string }[] = [
    { id: 'atom-one-dark', name: 'Atom One Dark' },
    { id: 'atom-one-light', name: 'Atom One Light' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'github', name: 'GitHub Light' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'nord', name: 'Nord' },
    { id: 'solarized-dark', name: 'Solarized Dark' },
];


const ProfileSettings: React.FC<Pick<SidebarProps, 'theme' | 'setTheme' | 'highlightTheme' | 'setHighlightTheme'>> = ({ theme, setTheme, highlightTheme, setHighlightTheme }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [userName, setUserName] = useState('Alex Jordan');
    const [userEmail, setUserEmail] = useState('alex.jordan@ajstudioz.com');
    const [isEditing, setIsEditing] = useState(false);
    
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);
  
    const handleCancel = () => setIsEditing(false);
  
    const handleSave = () => {
      setUserName(editName);
      setUserEmail(editEmail);
      setIsEditing(false);
    };

    return (
        <div className="mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-900">
             <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="profile-settings-content"
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-300 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userName}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
                    </div>
                </div>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-zinc-500" /> : <ChevronDownIcon className="h-5 w-5 text-zinc-500" />}
            </button>
            <div
                id="profile-settings-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 px-2 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-500 px-1">APPEARANCE</label>
                        <div className="p-1 mt-1 flex items-center gap-1 bg-zinc-200 dark:bg-zinc-900 rounded-full shadow-inner">
                            <button 
                                onClick={() => setTheme('light')}
                                className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    theme === 'light' 
                                    ? 'bg-white text-zinc-800 shadow-md' 
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                                aria-pressed={theme === 'light'}
                            >
                                <SunIcon className="h-4 w-4" /> <span>Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-gradient-to-r from-zinc-900 to-black text-white shadow-md shadow-black/30' 
                                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                                aria-pressed={theme === 'dark'}
                            >
                                <SparklesIcon className="h-4 w-4" /> <span>Premium</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="theme-select" className="text-xs font-semibold text-zinc-500 px-1">CODE THEME</label>
                        <div className="relative mt-1">
                            <PaletteIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 dark:text-zinc-400 pointer-events-none" />
                            <select
                                id="theme-select"
                                value={highlightTheme}
                                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                                className="w-full appearance-none bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 pl-10 text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-700 cursor-pointer"
                                aria-label="Select code block theme"
                            >
                            {themes.map(theme => (<option key={theme.id} value={theme.id}>{theme.name}</option>))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="space-y-3 pt-2">
                             <div>
                                <label htmlFor="edit-name" className="text-xs font-semibold text-zinc-500 px-1">NAME</label>
                                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full bg-zinc-200 dark:bg-zinc-900 rounded-lg p-2 text-sm border-zinc-300 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-500 text-zinc-900 dark:text-white" aria-label="User name"/>
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="text-xs font-semibold text-zinc-500 px-1">EMAIL</label>
                                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1 w-full bg-zinc-200 dark:bg-zinc-900 rounded-lg p-2 text-sm border-zinc-300 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-500 text-zinc-500 dark:text-zinc-400" aria-label="User email"/>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={handleCancel} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                                    <XIcon className="h-3.5 w-3.5" /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
                                    <CheckIcon className="h-3.5 w-3.5" /> <span>Save</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2">
                             <button onClick={() => { setEditName(userName); setEditEmail(userEmail); setIsEditing(true); }} className="flex items-center justify-center w-full gap-2 p-2 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                <SettingsIcon className="h-4 w-4"/>
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const SidebarComponent: React.FC<SidebarProps> = ({ onNewChat, isOpen, onClose, theme, setTheme, highlightTheme, setHighlightTheme, currentView, onViewChange }) => {
  const handleNewChatClick = () => {
    onNewChat();
    onViewChange('chat');
    onClose(); // Close sidebar on mobile after starting new chat
  };
  
  return (
    <aside className={`
      p-4 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-900 
      transform transition-transform transition-colors duration-300 ease-in-out
      fixed w-72 top-0 left-0 z-40 
      md:flex md:static md:w-72 md:translate-x-0
      ${theme === 'dark' 
        ? 'bg-gradient-to-b from-zinc-950 to-black' 
        : 'bg-zinc-50'
      }
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative p-0.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/25">
            <div className="p-1.5 bg-white dark:bg-black rounded-full">
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz Logo" 
                className="h-6 w-6 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className={`text-lg font-semibold tracking-wide ${
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          }`}>AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className={`md:hidden transition-colors ${
          theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
        }`}>
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className={`flex items-center justify-between w-full gap-3 p-3 mb-4 rounded-lg text-sm font-medium border transition-colors ${
          theme === 'dark'
            ? 'text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
            : 'text-zinc-900 bg-zinc-200 hover:bg-zinc-300 border-zinc-300'
        }`}
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

      <ProfileSettings
        theme={theme}
        setTheme={setTheme}
        highlightTheme={highlightTheme}
        setHighlightTheme={setHighlightTheme}
      />
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent);
