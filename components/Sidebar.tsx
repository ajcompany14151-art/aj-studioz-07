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

// Theme configurations
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-950',
    bgSecondary: 'bg-zinc-900/60',
    border: 'border-zinc-800/30',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    hover: 'hover:bg-zinc-800/40',
    gradient: 'from-purple-600 to-blue-600',
    active: 'bg-zinc-800/60'
  },
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    hover: 'hover:bg-gray-100',
    gradient: 'from-purple-600 to-blue-600',
    active: 'bg-gray-100'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800/60',
    border: 'border-slate-700/30',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    hover: 'hover:bg-slate-700/40',
    gradient: 'from-indigo-600 to-cyan-600',
    active: 'bg-slate-800/60'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800/60',
    border: 'border-gray-700/30',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-gray-700/40',
    gradient: 'from-green-600 to-emerald-600',
    active: 'bg-gray-800/60'
  }
};

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
  theme: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, onClick, isActive, premium = false, badge, theme }) => {
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out overflow-hidden touch-manipulation min-h-[44px] ${
        isActive
          ? `${currentThemeConfig.active} ${currentThemeConfig.text}`
          : `${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`
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
};

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
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState(user?.name || 'Alex Jordan');
    const [userEmail, setUserEmail] = useState(user?.email || 'alex.jordan@ajstudioz.com');
    const [isEditing, setIsEditing] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [isPremium, setIsPremium] = useState(true); // Enhancement: Add premium status
    
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);
    
    const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
    const handleCancel = () => setIsEditing(false);
  
    const handleSave = () => {
      setUserName(editName);
      setUserEmail(editEmail);
      setIsEditing(false);
    };

    const toggleNotifications = () => setNotifications(!notifications);

    return (
        <div className={`mt-auto pt-4 border-t ${currentThemeConfig.border} transition-all duration-200`}>
             <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="profile-settings-content"
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 ease-out overflow-hidden touch-manipulation min-h-[44px] ${currentThemeConfig.hover}`}
            >
                <div className="relative z-10 flex items-center gap-3">
                    <div className={`relative flex-shrink-0 w-8 h-8 rounded-full border ${currentThemeConfig.border} flex items-center justify-center transition-all duration-200 ${currentThemeConfig.bgSecondary}`}>
                        {isPremium && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <CrownIcon className="h-2 w-2 text-black" />
                          </div>
                        )}
                        {user?.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-4 w-4 relative z-10 text-white" />
                        )}
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className={`text-sm font-medium truncate ${currentThemeConfig.text} flex items-center gap-1`}>
                          {userName}
                          {isPremium && <SparklesIcon className="h-3 w-3 text-yellow-400" />}
                        </p>
                        <p className={`text-xs truncate ${currentThemeConfig.textSecondary}`}>{userEmail}</p>
                    </div>
                </div>
                <div className="relative z-10">
                  {isOpen ? <ChevronUpIcon className="h-4 w-4 transition-transform duration-200 text-zinc-400" /> : <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 rotate-180 text-zinc-400" />}
                </div>
            </button>
            <div
                id="profile-settings-content"
                className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 px-2 space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                        <label className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>APPEARANCE</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] ${
                                    theme === 'dark' 
                                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' 
                                    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'dark'}
                            >
                                <MoonIcon className="h-3.5 w-3.5" /> <span>Dark</span>
                            </button>
                            <button 
                                onClick={() => setTheme('light')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] ${
                                    theme === 'light' 
                                    ? 'bg-white text-gray-900 shadow-md border border-gray-300' 
                                    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'light'}
                            >
                                <SunIcon className="h-3.5 w-3.5" /> <span>Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('z-ai')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] ${
                                    theme === 'z-ai' 
                                    ? 'bg-slate-800 text-white shadow-md border border-slate-600' 
                                    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'z-ai'}
                            >
                                <div className="h-3.5 w-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></div> <span>Z.AI</span>
                            </button>
                            <button 
                                onClick={() => setTheme('chatgpt')}
                                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] ${
                                    theme === 'chatgpt' 
                                    ? 'bg-gray-800 text-white shadow-md border border-gray-600' 
                                    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98]'
                                }`}
                                aria-pressed={theme === 'chatgpt'}
                            >
                                <div className="h-3.5 w-3.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div> <span>ChatGPT</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="theme-select" className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>CODE THEME</label>
                        <div className="relative">
                            <PaletteIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-all duration-200 ${currentThemeConfig.textSecondary}`} />
                            <select
                                id="theme-select"
                                value={highlightTheme}
                                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                                className={`w-full appearance-none rounded-lg p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 cursor-pointer transition-all duration-200 touch-manipulation min-h-[40px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:border-purple-400/50`}
                                aria-label="Select code block theme"
                            >
                            {themes.map(theme => (<option key={theme.id} value={theme.id}>{theme.name}</option>))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none transition-transform duration-200 text-zinc-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-xs font-medium px-1 block flex items-center gap-2 ${currentThemeConfig.textSecondary}`}>
                          <BellIcon className="h-3.5 w-3.5" /> NOTIFICATIONS
                        </label>
                        <button 
                          onClick={toggleNotifications}
                          className={`relative w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] border ${currentThemeConfig.border} active:scale-[0.98] ${
                            notifications 
                              ? `${currentThemeConfig.active} ${currentThemeConfig.text}` 
                              : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`
                          }`}
                          aria-pressed={notifications}
                        >
                          {notifications ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    
                    {/* Premium status section */}
                    <div className="space-y-2">
                        <label className={`text-xs font-medium px-1 block flex items-center gap-2 ${currentThemeConfig.textSecondary}`}>
                          <CrownIcon className="h-3.5 w-3.5 text-yellow-400" /> PREMIUM
                        </label>
                        <div className={`p-2.5 rounded-lg ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-yellow-300">Premium Active</span>
                                <span className="text-xs text-yellow-400">Unlimited</span>
                            </div>
                            <p className={`text-xs ${currentThemeConfig.textSecondary}`}>Enjoy unlimited access to all features</p>
                        </div>
                    </div>
                    
                    {/* Account section with Google Sign-In */}
                    {!user ? (
                      <div className="space-y-2">
                        <label className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>ACCOUNT</label>
                        <button className="group relative flex items-center justify-center w-full gap-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] bg-white text-black hover:bg-zinc-100">
                          <GoogleIcon className="h-4 w-4" />
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>ACCOUNT</label>
                        <button className={`group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`}>
                            <div className="flex items-center gap-3">
                                <ShieldIcon className="h-3.5 w-3.5" />
                                <span>Privacy & Security</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button className={`group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`}>
                            <div className="flex items-center gap-3">
                                <CreditCardIcon className="h-3.5 w-3.5" />
                                <span>Billing & Plans</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button className={`group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`}>
                            <div className="flex items-center gap-3">
                                <HelpCircleIcon className="h-3.5 w-3.5" />
                                <span>Help & Support</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                        <button 
                          onClick={onSignOut}
                          className={`group relative flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover === 'hover:bg-zinc-800/40' ? 'hover:bg-red-900/40' : currentThemeConfig.hover} hover:text-red-400`}
                        >
                            <div className="flex items-center gap-3">
                                <LogOutIcon className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </div>
                            <ChevronDownIcon className="h-3.5 w-3.5 rotate-270" />
                        </button>
                    </div>
                    )}
                    
                    {isEditing ? (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-1 duration-200">
                             <div className="space-y-1">
                                <label htmlFor="edit-name" className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>NAME</label>
                                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`mt-1 w-full rounded-lg p-2.5 text-sm focus:ring-2 transition-all duration-200 touch-manipulation min-h-[40px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:ring-purple-400/30`} aria-label="User name"/>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="edit-email" className={`text-xs font-medium px-1 block ${currentThemeConfig.textSecondary}`}>EMAIL</label>
                                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`mt-1 w-full rounded-lg p-2.5 text-sm focus:ring-2 transition-all duration-200 touch-manipulation min-h-[40px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:ring-purple-400/30`} aria-label="User email"/>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                                <button onClick={handleCancel} className={`relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[40px] w-full sm:w-auto ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text} active:scale-[0.98]`}>
                                    <XIcon className="h-3.5 w-3.5" /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} className="relative overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation active:scale-[0.98] min-h-[40px] w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                                    <CheckIcon className="h-3.5 w-3.5" /> <span>Save</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2 animate-in slide-in-from-bottom-1 duration-200">
                             <button onClick={() => { setEditName(userName); setEditEmail(userEmail); setIsEditing(true); }} className={`group relative flex items-center justify-center w-full gap-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`}>
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
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <aside className={`p-4 flex flex-col h-full border-r transition-all duration-200 ease-out fixed w-64 top-0 left-0 z-40 md:flex md:static md:w-64 md:translate-x-0 ${currentThemeConfig.bg} ${currentThemeConfig.border} shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-sm">
            <div className={`p-1.5 ${theme === 'light' ? 'bg-white' : 'bg-zinc-950'} rounded-full`}>
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz Logo" 
                className="h-4 w-4 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-lg font-medium tracking-wide transition-all duration-200 relative z-10 text-white">AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className={`md:hidden group relative transition-all duration-200 p-2 rounded-lg touch-manipulation active:scale-[0.95] min-h-[40px] min-w-[40px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} ${currentThemeConfig.text}`}>
          <XIcon className="h-5 w-5 relative z-10" />
        </button>
      </div>

      <button 
        onClick={handleNewChatClick}
        className={`group relative flex items-center justify-between w-full gap-3 px-3 py-2 mb-6 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm touch-manipulation active:scale-[0.98] min-h-[44px] text-white ${currentThemeConfig.bgSecondary} ${currentThemeConfig.border} ${currentThemeConfig.hover}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <PlusIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90 group-active:rotate-0" />
            <ZapIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-yellow-400 animate-pulse" />
          </div>
          <span className="relative z-10">New Chat</span>
        </div>
      </button>

      <nav className="flex-grow space-y-1 relative z-10">
        <SidebarNavItem 
            icon={<SearchIcon className="h-4 w-4" />} 
            label="Explore" 
            onClick={() => onViewChange('explore')}
            isActive={currentView === 'explore'}
            premium
            badge="New"
            theme={theme}
        />
        <SidebarNavItem 
            icon={<HistoryIcon className="h-4 w-4" />} 
            label="Chat History" 
            onClick={() => onViewChange('history')}
            isActive={currentView === 'history'}
            theme={theme}
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
