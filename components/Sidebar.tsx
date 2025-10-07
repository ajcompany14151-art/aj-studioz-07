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
import { BellIcon } from './icons/BellIcon';
import { MoonIcon } from './icons/MoonIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { 
  CrownIcon, 
  ZapIcon, 
  ShieldIcon, 
  CreditCardIcon, 
  HelpCircleIcon, 
  LogOutIcon 
} from './icons/CustomIcons';

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
  isMobile: boolean;
  user?: any;
  onSignOut?: () => void;
}

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
  premium?: boolean;
  badge?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, onClick, isActive, premium = false, badge }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden touch-manipulation min-h-[44px] ${
      isActive
        ? 'bg-zinc-800/60 text-purple-300 shadow-md shadow-purple-500/20'
        : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white hover:shadow-md hover:shadow-zinc-700/20 active:scale-[0.98]'
    }`}
    onTouchStart={(e) => e.preventDefault()} // Mobile: Prevent double-tap
  >
    <div className="relative z-10 flex items-center gap-3">
      {icon}
      <span className="relative z-10">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
          {badge}
        </span>
      )}
    </div>
    {premium && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <CrownIcon className="h-3.5 w-3.5 text-yellow-400 animate-bounce" />
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

const ProfileSettings: React.FC<Pick<SidebarProps, 'theme' | 'setTheme' | 'highlightTheme' | 'setHighlightTheme' | 'user' | 'onSignOut'>> = ({ theme, setTheme, highlightTheme, setHighlightTheme, user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [userName, setUserName] = useState(user?.name || 'Alex Jordan');
    const [userEmail, setUserEmail] = useState(user?.email || 'alex.jordan@ajstudioz.com');
    const [isEditing, setIsEditing] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [isPremium, setIsPremium] = useState(true); // Enhancement: Add premium status
    
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
        <div className="mt-auto pt-4 border-t border-zinc-800/50 transition-all duration-300">
             <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="profile-settings-content"
                className="group flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ease-out overflow-hidden touch-manipulation min-h-[44px] hover:bg-zinc-800/40 hover:shadow-md hover:shadow-zinc-700/20 active:scale-[0.98]"
            >
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-9 h-9 rounded-full border border-zinc-700/50 flex items-center justify-center transition-all duration-300 bg-zinc-900/50">
                        {isPremium && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <CrownIcon className="h-2 w-2 text-black" />
                          </div>
                        )}
                        {user?.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-4.5 w-4.5 relative z-10 text-white" />
                        )}
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className="text-sm font-medium truncate text-white flex items-center gap-1">
                          {userName}
                          {isPremium && <SparklesIcon className="h-3 w-3 text-yellow-400" />}
                        </p>
                        <p className="text-xs truncate text-zinc-400">{userEmail}</p>
                    </div>
                </div>
                <div className="relative z-10">
                  {isOpen ? <ChevronUpIcon className="h-4 w-4 transition-transform duration-300 text-zinc-400" /> : <ChevronDownIcon className="h-4 w-4 transition-transform duration-300 rotate-180 text-zinc-400" />}
                </div>
            </button>
            <div
                id="profile-settings-content"
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 px-2 space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-medium px-1 block text-zinc-400">APPEARANCE</label>
                        <div className="p-1 flex items-center gap-1 rounded-lg bg-zinc-900/50">
                            <button 
                                onClick={() => setTheme('light')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation min-h-[40px] ${
                                    theme === 'light' 
                                    ? 'bg-white text-zinc-800 shadow-md' 
                                    : 'text-zinc-400 hover:text-zinc-200 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'light'}
                            >
                                <SunIcon className="h-3.5 w-3.5" /> <span>Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation min-h-[40px] ${
                                    theme === 'dark' 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                                    : 'text-zinc-400 hover:text-white active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'dark'}
                            >
                                <MoonIcon className="h-3.5 w-3.5" /> <span>Dark</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="theme-select" className="text-xs font-medium px-1 block text-zinc-400">CODE THEME</label>
                        <div className="relative">
                            <PaletteIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-all duration-300 text-zinc-400" />
                            <select
                                id="theme-select"
                                value={highlightTheme}
                                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                                className="w-full appearance-none rounded-lg p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 cursor-pointer transition-all duration-300 touch-manipulation min-h-[40px] bg-zinc-900/50 border border-zinc-800/50 text-white focus:border-purple-400/50"
                                aria-label="Select code block theme"
                            >
                            {themes.map(theme => (<option key={theme.id} value={theme.id}>{theme.name}</option>))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none transition-transform duration-300 text-zinc-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium px-1 block flex items-center gap-2 text-zinc-400">
                          <BellIcon className="h-3.5 w-3.5" /> NOTIFICATIONS
                        </label>
                        <button 
                          onClick={toggleNotifications}
                          className={`relative w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation min-h-[40px] border border-zinc-800/50 active:scale-[0.98] ${
                            notifications 
                              ? 'bg-zinc-800/60 text-purple-300' 
                              : 'bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800/40 hover:text-white'
                          }`}
                          aria-pressed={notifications}
                        >
                          {notifications ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    
                    {/* Premium status section */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium px-1 block flex items-center gap-2 text-zinc-400">
                          <CrownIcon className="h-3.5 w-3.5 text-yellow-400" /> PREMIUM
                        </label>
                        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-yellow-300">Premium Active</span>
                                <span className="text-xs text-yellow-400">Unlimited</span>
                            </div>
                            <p className="text-xs text-zinc-400">Enjoy unlimited access to all features</p>
                        </div>
                    </div>
                    
                    {/* Account section with Google Sign-In */}
                    {!user ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium px-1 block text-zinc-400">ACCOUNT</label>
                        <button className="group relative flex items-center justify-center w-full gap-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] bg-white text-black hover:bg-zinc-100">
                          <GoogleIcon className="h-4 w-4" />
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-medium px-1 block text-zinc-400">ACCOUNT</label>
                        <button className="group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] text-zinc-300 hover:bg-zinc-800/40 hover:text-white">
                            <div className="flex items-center gap-3">
                                <ShieldIcon className="h-3.5 w-3.5" />
                                <span>Privacy & Security</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button className="group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] text-zinc-300 hover:bg-zinc-800/40 hover:text-white">
                            <div className="flex items-center gap-3">
                                <CreditCardIcon className="h-3.5 w-3.5" />
                                <span>Billing & Plans</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button className="group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] text-zinc-300 hover:bg-zinc-800/40 hover:text-white">
                            <div className="flex items-center gap-3">
                                <HelpCircleIcon className="h-3.5 w-3.5" />
                                <span>Help & Support</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button 
                          onClick={onSignOut}
                          className="group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] text-zinc-300 hover:bg-red-900/40 hover:text-red-400">
                            <div className="flex items-center gap-3">
                                <LogOutIcon className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                    </div>
                    )}
                    
                    {isEditing ? (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-1 duration-300">
                             <div className="space-y-1">
                                <label htmlFor="edit-name" className="text-xs font-medium px-1 block text-zinc-400">NAME</label>
                                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full rounded-lg p-2.5 text-sm focus:ring-2 transition-all duration-300 touch-manipulation min-h-[40px] bg-zinc-900/50 border border-zinc-800/50 focus:ring-purple-400/30 text-white" aria-label="User name"/>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="edit-email" className="text-xs font-medium px-1 block text-zinc-400">EMAIL</label>
                                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1 w-full rounded-lg p-2.5 text-sm focus:ring-2 transition-all duration-300 touch-manipulation min-h-[40px] bg-zinc-900/50 border border-zinc-800/50 focus:ring-purple-400/30 text-white" aria-label="User email"/>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                                <button onClick={handleCancel} className="relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation min-h-[40px] w-full sm:w-auto text-zinc-300 hover:bg-zinc-800/40 active:scale-[0.98]">
                                    <XIcon className="h-3.5 w-3.5" /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} className="relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation active:scale-[0.98] min-h-[40px] w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                                    <CheckIcon className="h-3.5 w-3.5" /> <span>Save</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2 animate-in slide-in-from-bottom-1 duration-300">
                             <button onClick={() => { setEditName(userName); setEditEmail(userEmail); setIsEditing(true); }} className="group relative flex items-center justify-center w-full gap-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] text-zinc-300 hover:bg-zinc-800/40 hover:text-white">
                                <SettingsIcon className="h-3.5 w-3.5 relative z-10 group-hover:rotate-12 transition-transform"/>
                                <span className="relative z-10">Edit Profile</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SidebarComponent: React.FC<SidebarProps> = ({ onNewChat, isOpen, onClose, theme, setTheme, highlightTheme, setHighlightTheme, currentView, onViewChange, isMobile, user, onSignOut }) => {
  const handleNewChatClick = () => {
    onNewChat();
    onViewChange('chat');
    onClose(); // Close sidebar on mobile after starting new chat
  };
  
  return (
    <aside className={`p-4 flex flex-col h-full border-r transition-all duration-300 ease-out fixed w-72 top-0 left-0 z-40 md:flex md:static md:w-72 md:translate-x-0 bg-zinc-950 border-zinc-800/50 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-md shadow-purple-500/30">
            <div className="p-1.5 bg-zinc-950 rounded-full">
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz Logo" 
                className="h-5 w-5 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-lg font-medium tracking-wide transition-all duration-300 relative z-10 text-white">AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className="md:hidden group relative transition-all duration-300 p-2 rounded-lg touch-manipulation active:scale-[0.95] min-h-[40px] min-w-[40px] text-zinc-400 hover:text-white hover:bg-zinc-800/40">
          <XIcon className="h-5 w-5 relative z-10" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className="group relative flex items-center justify-between w-full gap-3 p-3 mb-6 rounded-lg text-sm font-medium transition-all duration-300 shadow-md touch-manipulation active:scale-[0.98] min-h-[44px] text-white bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 group-active:rotate-0" />
            <ZapIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-yellow-400 animate-pulse" />
          </div>
          <span className="relative z-10">New Chat</span>
        </div>
      </button>

      <nav className="flex-grow space-y-2 relative z-10">
        <SidebarNavItem 
            icon={<SearchIcon className="h-4 w-4" />} 
            label="Explore" 
            onClick={() => onViewChange('explore')}
            isActive={currentView === 'explore'}
            premium
            badge="New"
        />
        <SidebarNavItem 
            icon={<HistoryIcon className="h-4 w-4" />} 
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
        user={user}
        onSignOut={onSignOut}
      />
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent);
