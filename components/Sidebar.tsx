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
    className={`flex items-center w-full gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 text-zinc-900 dark:text-white shadow-lg dark:shadow-black/30'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-gradient-to-r hover:from-zinc-100 hover:to-zinc-50 dark:hover:from-zinc-900 dark:hover:to-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:shadow-md'
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
        <div className={`mt-auto pt-2 border-t transition-all duration-500 ${
          theme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200'
        }`}>
             <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="profile-settings-content"
                className={`flex items-center justify-between w-full p-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'hover:bg-zinc-800/50' 
                    : 'hover:bg-zinc-100'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 shadow-lg shadow-black/30'
                        : 'bg-gradient-to-br from-zinc-200 to-zinc-300 border-zinc-300'
                    }`}>
                        <UserIcon className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
                        }`} />
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className={`text-sm font-semibold truncate ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                        }`}>{userName}</p>
                        <p className={`text-xs truncate ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>{userEmail}</p>
                    </div>
                </div>
                {isOpen ? <ChevronUpIcon className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`} /> : <ChevronDownIcon className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`} />}
            </button>
            <div
                id="profile-settings-content"
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 px-2 space-y-4">
                    <div>
                        <label className={`text-xs font-semibold px-1 ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>APPEARANCE</label>
                        <div className={`p-1 mt-1 flex items-center gap-1 rounded-full shadow-inner transition-all duration-500 ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-black/30'
                            : 'bg-gradient-to-r from-zinc-200 to-zinc-100'
                        }`}>
                            <button 
                                onClick={() => setTheme('light')}
                                className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                    theme === 'light' 
                                    ? 'bg-gradient-to-r from-white to-zinc-50 text-zinc-800 shadow-lg shadow-zinc-200/50' 
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                                aria-pressed={theme === 'light'}
                            >
                                <SunIcon className="h-4 w-4" /> <span>Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                    theme === 'dark' 
                                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white shadow-lg shadow-purple-500/30' 
                                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                                aria-pressed={theme === 'dark'}
                            >
                                <SparklesIcon className="h-4 w-4" /> <span>Premium</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="theme-select" className={`text-xs font-semibold px-1 ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>CODE THEME</label>
                        <div className="relative mt-1">
                            <PaletteIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                            }`} />
                            <select
                                id="theme-select"
                                value={highlightTheme}
                                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                                className={`w-full appearance-none rounded-lg p-3 pl-10 text-sm focus:outline-none focus:ring-2 cursor-pointer transition-all duration-300 ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-300 focus:ring-purple-500/50 focus:border-purple-500/50'
                                    : 'bg-gradient-to-r from-zinc-100 to-zinc-50 border-zinc-300 text-zinc-800 focus:ring-zinc-500/50 focus:border-zinc-500/50'
                                }`}
                                aria-label="Select code block theme"
                            >
                            {themes.map(theme => (<option key={theme.id} value={theme.id}>{theme.name}</option>))}
                            </select>
                            <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                            }`} />
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="space-y-3 pt-2">
                             <div>
                                <label htmlFor="edit-name" className={`text-xs font-semibold px-1 ${
                                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                }`}>NAME</label>
                                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`mt-1 w-full rounded-lg p-2 text-sm focus:ring-1 transition-all duration-300 ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 border-zinc-700 focus:ring-purple-500/50 text-zinc-100'
                                    : 'bg-gradient-to-r from-zinc-100 to-zinc-50 border-zinc-300 focus:ring-zinc-500/50 text-zinc-900'
                                }`} aria-label="User name"/>
                            </div>
                            <div>
                                <label htmlFor="edit-email" className={`text-xs font-semibold px-1 ${
                                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                                }`}>EMAIL</label>
                                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`mt-1 w-full rounded-lg p-2 text-sm focus:ring-1 transition-all duration-300 ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 border-zinc-700 focus:ring-purple-500/50 text-zinc-400'
                                    : 'bg-gradient-to-r from-zinc-100 to-zinc-50 border-zinc-300 focus:ring-zinc-500/50 text-zinc-500'
                                }`} aria-label="User email"/>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={handleCancel} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                  theme === 'dark'
                                    ? 'text-zinc-300 hover:bg-zinc-800/50'
                                    : 'text-zinc-600 hover:bg-zinc-100'
                                }`}>
                                    <XIcon className="h-3.5 w-3.5" /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30'
                                    : 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white hover:from-zinc-800 hover:to-zinc-700 shadow-lg shadow-zinc-200/30'
                                }`}>
                                    <CheckIcon className="h-3.5 w-3.5" /> <span>Save</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2">
                             <button onClick={() => { setEditName(userName); setEditEmail(userEmail); setIsEditing(true); }} className={`flex items-center justify-center w-full gap-2 p-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                               theme === 'dark'
                                 ? 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100'
                                 : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                             }`}>
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
      p-4 flex flex-col h-full border-r transition-all duration-500 ease-in-out
      fixed w-72 top-0 left-0 z-40 
      md:flex md:static md:w-72 md:translate-x-0
      ${theme === 'dark' 
        ? 'bg-gradient-to-b from-slate-950 via-zinc-950 to-slate-950 border-zinc-800/50 shadow-xl shadow-black/30' 
        : 'bg-gradient-to-b from-white via-zinc-50 to-white border-zinc-200/50 shadow-xl shadow-zinc-200/10'
      }
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Premium dark mode decorative elements */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-20 left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-40 right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </>
      )}
      
      <div className="flex items-center justify-between mb-6 relative z-10">
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
          <h1 className={`text-lg font-semibold tracking-wide transition-all duration-500 ${
            theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
          }`}>AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className={`md:hidden transition-all duration-300 p-1 rounded-lg ${
          theme === 'dark' 
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' 
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
        }`}>
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className={`flex items-center justify-between w-full gap-3 p-3 mb-4 rounded-xl text-sm font-medium border transition-all duration-300 shadow-lg ${
          theme === 'dark'
            ? 'text-white bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-zinc-700/50 shadow-black/30 hover:shadow-purple-500/20'
            : 'text-zinc-900 bg-gradient-to-r from-zinc-100 to-zinc-50 hover:from-zinc-200 hover:to-zinc-100 border-zinc-300/50 shadow-zinc-200/30 hover:shadow-zinc-300/40'
        }`}
      >
        <span>New Chat</span>
        <PlusIcon className="h-4 w-4" />
      </button>

      <nav className="flex-grow space-y-2 relative z-10">
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
