// components/Sidebar.tsx
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
import { BellIcon } from './icons/BellIcon'; // Assume added

// Simple CrownIcon component to replace the missing import
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7M12 3v18" />
  </svg>
);

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highlightTheme: HighlightTheme;
  setHighlightTheme: (highlightTheme: HighlightTheme) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
  premium?: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, onClick, isActive, premium = false }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full gap-3 p-4 rounded-2xl text-sm font-bold transition-all duration-500 ease-out overflow-hidden touch-manipulation ${
      isActive
        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 shadow-lg shadow-purple-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/30 before:to-blue-500/30 before:opacity-0 before:animate-pulse animate-float-glow'
        : 'text-zinc-400 hover:bg-gradient-to-r hover:from-zinc-900/50 hover:to-black/50 hover:text-white hover:shadow-lg hover:shadow-purple-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:rounded-2xl before:opacity-0 before:transition-all before:group-hover:opacity-100 active:scale-[0.98]'
    }`}
    onTouchStart={(e) => e.preventDefault()} // Mobile: Prevent double-tap
  >
    <div className="relative z-10 flex items-center gap-3">
      {icon}
      <span className="relative z-10">{label}</span>
    </div>
    {premium && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <CrownIcon className="h-4 w-4 text-yellow-400 animate-bounce" />
      </div>
    )}
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
    { id: 'vs2015', name: 'VS 2015' },
    { id: 'ir-black', name: 'IR Black' },
];


const ProfileSettings: React.FC<Pick<SidebarProps, 'theme' | 'setTheme' | 'highlightTheme' | 'setHighlightTheme'>> = ({ theme, setTheme, highlightTheme, setHighlightTheme }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [userName, setUserName] = useState('Alex Jordan');
    const [userEmail, setUserEmail] = useState('alex.jordan@ajstudioz.com');
    const [isEditing, setIsEditing] = useState(false);
    const [notifications, setNotifications] = useState(true); // Enhancement: Add notifications toggle
    
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);
  
    const handleCancel = () => setIsEditing(false);
  
    const handleSave = () => {
      setUserName(editName);
      setUserEmail(editEmail);
      setIsEditing(false);
    };

    const toggleNotifications = () => setNotifications(!notifications);

    return (
        <div className="mt-auto pt-4 border-t border-zinc-700/30 transition-all duration-700 ease-out">
             <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="profile-settings-content"
                className="group flex items-center justify-between w-full p-3 rounded-2xl transition-all duration-500 ease-out overflow-hidden touch-manipulation hover:bg-zinc-900/30 hover:shadow-lg hover:shadow-purple-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:to-blue-500/5 before:opacity-0 before:transition-opacity before:group-hover:opacity-100 active:scale-[0.98] animate-float-glow"
            >
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-lg touch-manipulation bg-gradient-to-br from-black to-zinc-950 border-zinc-700/30 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-purple-500/20 before:to-blue-500/20 before:opacity-0 before:animate-pulse animate-float-glow">
                        <UserIcon className="h-5 w-5 relative z-10 text-white" />
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className="text-sm font-bold truncate text-white">{userName}</p>
                        <p className="text-xs truncate text-zinc-400">{userEmail}</p>
                    </div>
                </div>
                <div className="relative z-10">
                  {isOpen ? <ChevronUpIcon className="h-5 w-5 transition-transform duration-300 text-zinc-400" /> : <ChevronDownIcon className="h-5 w-5 transition-transform duration-300 rotate-180 text-zinc-400" />}
                </div>
            </button>
            <div
                id="profile-settings-content"
                className={`overflow-hidden transition-all duration-700 ease-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 px-2 space-y-4 animate-in fade-in duration-500">
                    <div className="space-y-2">
                        <label className="text-xs font-bold px-1 block text-zinc-400">APPEARANCE</label>
                        <div className="p-1.5 flex items-center gap-1.5 rounded-full shadow-inner transition-all duration-500 backdrop-blur-xl bg-gradient-to-r from-black/50 to-zinc-950/50">
                            <button 
                                onClick={() => setTheme('light')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 touch-manipulation ${
                                    theme === 'light' 
                                    ? 'bg-gradient-to-r from-white to-zinc-50 text-zinc-800 shadow-lg shadow-zinc-200/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:opacity-100' 
                                    : 'text-zinc-400 hover:text-zinc-200 hover:shadow-md hover:shadow-zinc-700/20 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'light'}
                            >
                                <SunIcon className="h-4 w-4" /> <span>Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 touch-manipulation ${
                                    theme === 'dark' 
                                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white shadow-lg shadow-purple-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-100 animate-float-glow' 
                                    : 'text-zinc-400 hover:text-white hover:shadow-md hover:shadow-zinc-200/20 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'dark'}
                            >
                                <SparklesIcon className="h-4 w-4" /> <span>Premium Dark</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="theme-select" className="text-xs font-bold px-1 block text-zinc-400">CODE THEME</label>
                        <div className="relative">
                            <PaletteIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none transition-all duration-300 text-zinc-400" />
                            <select
                                id="theme-select"
                                value={highlightTheme}
                                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                                className="w-full appearance-none rounded-2xl p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 cursor-pointer transition-all duration-500 shadow-lg touch-manipulation bg-gradient-to-r from-black/70 to-zinc-950/70 border-zinc-700/30 text-white focus:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 animate-float-glow"
                                aria-label="Select code block theme"
                            >
                            {themes.map(theme => (<option key={theme.id} value={theme.id}>{theme.name}</option>))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-transform duration-300 text-zinc-400" />
                        </div>
                    </div>
                    {/* Enhancement: Add notifications toggle */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold px-1 block flex items-center gap-2 text-zinc-400">
                          <BellIcon className="h-4 w-4" /> NOTIFICATIONS
                        </label>
                        <button 
                          onClick={toggleNotifications}
                          className="relative w-full p-3 rounded-2xl text-sm font-bold transition-all duration-500 touch-manipulation bg-black/50 border border-zinc-700/30 text-zinc-300 hover:bg-zinc-900/50 hover:text-white hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] animate-float-glow"
                          aria-pressed={notifications}
                        >
                          {notifications ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    {isEditing ? (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-1 duration-300">
                             <div className="space-y-1">
                                <label htmlFor="edit-name" className="text-xs font-bold px-1 block text-zinc-400">NAME</label>
                                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full rounded-2xl p-3 text-sm focus:ring-2 transition-all duration-500 shadow-lg touch-manipulation bg-gradient-to-r from-black/70 to-zinc-950/70 border-zinc-700/30 focus:ring-purple-400/30 text-white hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] animate-float-glow" aria-label="User name"/>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="edit-email" className="text-xs font-bold px-1 block text-zinc-400">EMAIL</label>
                                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1 w-full rounded-2xl p-3 text-sm focus:ring-2 transition-all duration-500 shadow-lg touch-manipulation bg-gradient-to-r from-black/70 to-zinc-950/70 border-zinc-700/30 focus:ring-purple-400/30 text-white hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] animate-float-glow" aria-label="User email"/>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button onClick={handleCancel} className="relative overflow-hidden flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-500 touch-manipulation text-zinc-300 hover:bg-zinc-900/30 hover:shadow-md hover:shadow-zinc-700/20 active:scale-[0.98]">
                                    <XIcon className="h-4 w-4" /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} className="relative overflow-hidden flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-500 shadow-lg touch-manipulation active:scale-[0.98] bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30 hover:shadow-purple-500/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:opacity-0 before:transition-opacity before:hover:opacity-100 animate-float-glow">
                                    <CheckIcon className="h-4 w-4" /> <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2 animate-in slide-in-from-bottom-1 duration-300">
                             <button onClick={() => { setEditName(userName); setEditEmail(userEmail); setIsEditing(true); }} className="group relative flex items-center justify-center w-full gap-2 p-3 rounded-2xl text-sm font-bold transition-all duration-500 overflow-hidden touch-manipulation active:scale-[0.98] text-zinc-300 hover:bg-zinc-900/30 hover:text-white hover:shadow-lg hover:shadow-purple-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:opacity-0 before:transition-all before:group-hover:opacity-100 animate-float-glow">
                                <SettingsIcon className="h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform"/>
                                <span className="relative z-10">Edit Profile</span>
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
    <aside className="p-4 flex flex-col h-full border-r transition-all duration-700 ease-out fixed w-80 top-0 left-0 z-40 md:flex md:static md:w-80 md:translate-x-0 bg-black border-zinc-700/30 shadow-2xl shadow-black/40 backdrop-blur-2xl before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] before:from-purple-900/10 before:to-transparent ${isOpen ? 'translate-x-0' : '-translate-x-full'} animate-float-glow">
      {/* Premium decorative elements */}
      <div className="absolute top-16 left-4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-48 right-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
            <div className="p-2 bg-black rounded-full shadow-inner">
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz Logo" 
                className="h-6 w-6 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-wide transition-all duration-700 relative z-10 text-white">AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className="md:hidden group relative transition-all duration-500 p-2 rounded-2xl touch-manipulation active:scale-[0.95] text-zinc-400 hover:text-white hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-purple-500/20 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:opacity-0 before:transition-all before:group-hover:opacity-100 animate-float-glow">
          <XIcon className="h-6 w-6 relative z-10" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className="group relative flex items-center justify-between w-full gap-3 p-4 mb-6 rounded-2xl text-sm font-bold border-2 transition-all duration-500 shadow-xl touch-manipulation active:scale-[0.98] text-white bg-gradient-to-r from-black/70 to-zinc-950/70 hover:from-zinc-900/70 hover:to-black/70 border-zinc-700/30 shadow-black/30 hover:shadow-purple-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/20 before:to-blue-500/20 before:opacity-0 before:transition-all before:group-hover:opacity-100 animate-float-glow"
      >
        <span className="relative z-10">New Chat</span>
        <div className="relative z-10">
          <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 group-active:rotate-0" />
        </div>
      </button>

      <nav className="flex-grow space-y-3 relative z-10">
        <SidebarNavItem 
            icon={<SearchIcon className="h-5 w-5" />} 
            label="Explore" 
            onClick={() => onViewChange('explore')}
            isActive={currentView === 'explore'}
            premium
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
