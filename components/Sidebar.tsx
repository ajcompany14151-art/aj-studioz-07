// components/Sidebar.tsx (Enhanced with more corporate features like billing, analytics)
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
  LogOutIcon,
  BarChartIcon,
  UsersIcon
} from './icons/CustomIcons';

// Enhanced theme configs
const themeConfigs = {
  dark: {
    bg: 'bg-zinc-950',
    bgSecondary: 'bg-zinc-900/70 backdrop-blur-xl',
    border: 'border-zinc-800/40',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    hover: 'hover:bg-zinc-800/50',
    gradient: 'from-purple-600 to-blue-600',
    active: 'bg-zinc-800/70'
  },
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50/70 backdrop-blur-xl',
    border: 'border-gray-200/40',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    hover: 'hover:bg-gray-100/50',
    gradient: 'from-purple-600 to-blue-600',
    active: 'bg-gray-100/70'
  },
  'z-ai': {
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800/70 backdrop-blur-xl',
    border: 'border-slate-700/40',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    hover: 'hover:bg-slate-700/50',
    gradient: 'from-indigo-600 to-cyan-600',
    active: 'bg-slate-800/70'
  },
  'chatgpt': {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800/70 backdrop-blur-xl',
    border: 'border-gray-700/40',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-gray-700/50',
    gradient: 'from-green-600 to-emerald-600',
    active: 'bg-gray-800/70'
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
  onBilling?: () => void;
  usageStats?: { queries: number; premium: boolean };
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
      className={`group relative flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out overflow-hidden touch-manipulation min-h-[48px] ${
        isActive
          ? `${currentThemeConfig.active} ${currentThemeConfig.text} shadow-md`
          : `${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
      }`}
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CrownIcon className="h-4 w-4 text-yellow-400 animate-bounce" />
        </div>
      )}
      <div className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${isActive ? 'bg-gradient-to-b from-purple-500 to-blue-500' : 'bg-transparent'}`}></div>
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

const ProfileSettings: React.FC<Pick<SidebarProps, 'theme' | 'setTheme' | 'highlightTheme' | 'setHighlightTheme' | 'user' | 'onSignOut' | 'usageStats' | 'onBilling'>> = ({ 
  theme, 
  setTheme, 
  highlightTheme, 
  setHighlightTheme, 
  user, 
  onSignOut,
  usageStats,
  onBilling 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState(user?.name || 'Alex Jordan');
  const [userEmail, setUserEmail] = useState(user?.email || 'alex.jordan@ajstudioz.com');
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isPremium, setIsPremium] = useState(usageStats?.premium || false);
  
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
    <div className={`mt-auto pt-4 border-t ${currentThemeConfig.border} transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ease-out overflow-hidden touch-manipulation min-h-[48px] ${currentThemeConfig.hover}`}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className={`relative flex-shrink-0 w-10 h-10 rounded-full border-2 ${currentThemeConfig.border} flex items-center justify-center transition-all duration-300 ${currentThemeConfig.bgSecondary}`}>
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <CrownIcon className="h-2 w-2 text-black" />
              </div>
            )}
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="overflow-hidden text-left">
            <p className={`text-sm font-semibold truncate ${currentThemeConfig.text} flex items-center gap-1`}>
              {userName}
              {isPremium && <SparklesIcon className="h-3 w-3 text-yellow-400 animate-pulse" />}
            </p>
            <p className={`text-xs truncate ${currentThemeConfig.textSecondary}`}>{userEmail}</p>
          </div>
        </div>
        <div className="relative z-10">
          {isOpen ? <ChevronUpIcon className="h-4 w-4 transition-transform duration-300 text-zinc-400 group-hover:text-white" /> : <ChevronDownIcon className="h-4 w-4 transition-transform duration-300 rotate-180 text-zinc-400 group-hover:text-white" />}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-4 px-4 space-y-4 animate-in fade-in duration-300">
          {/* Appearance */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary} flex items-center gap-2`}>
              <PaletteIcon className="h-3.5 w-3.5" /> APPEARANCE
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTheme('dark')}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] ${
                  theme === 'dark' 
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-600 ring-2 ring-purple-500/30' 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
                }`}
              >
                <MoonIcon className="h-4 w-4" /> Dark
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] ${
                  theme === 'light' 
                  ? 'bg-white text-gray-900 shadow-md border border-gray-300 ring-2 ring-purple-500/30' 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
                }`}
              >
                <SunIcon className="h-4 w-4" /> Light
              </button>
              <button 
                onClick={() => setTheme('z-ai')}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] ${
                  theme === 'z-ai' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-600 ring-2 ring-indigo-500/30' 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
                }`}
              >
                <div className="h-4 w-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></div> Z.AI
              </button>
              <button 
                onClick={() => setTheme('chatgpt')}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] ${
                  theme === 'chatgpt' 
                  ? 'bg-gray-800 text-white shadow-md border border-gray-600 ring-2 ring-emerald-500/30' 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
                }`}
              >
                <div className="h-4 w-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div> ChatGPT
              </button>
            </div>
          </div>

          {/* Code Theme */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary} flex items-center gap-2`}>
              <PaletteIcon className="h-3.5 w-3.5" /> CODE THEME
            </label>
            <div className="relative">
              <select
                value={highlightTheme}
                onChange={(e) => setHighlightTheme(e.target.value as HighlightTheme)}
                className={`w-full appearance-none rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 cursor-pointer transition-all duration-300 touch-manipulation min-h-[44px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:border-purple-400/50`}
              >
                {themes.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-transform text-zinc-400" />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold px-1 block flex items-center gap-2 ${currentThemeConfig.textSecondary}`}>
              <BellIcon className="h-3.5 w-3.5" /> NOTIFICATIONS
            </label>
            <button 
              onClick={toggleNotifications}
              className={`relative w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] border ${currentThemeConfig.border} active:scale-[0.98] ${
                notifications 
                  ? `${currentThemeConfig.active} ${currentThemeConfig.text}` 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
              }`}
            >
              {notifications ? 'Enabled • Real-time updates' : 'Disabled'}
            </button>
          </div>

          {/* Usage Stats */}
          {usageStats && (
            <div className="space-y-3">
              <label className={`text-xs font-semibold px-1 block flex items-center gap-2 ${currentThemeConfig.textSecondary}`}>
                <BarChartIcon className="h-3.5 w-3.5" /> USAGE
              </label>
              <div className={`p-3 rounded-xl ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border}`}>
                <div className="flex justify-between">
                  <span className="text-sm font-medium ${currentThemeConfig.text}">Queries this month</span>
                  <span className="text-sm ${isPremium ? 'text-green-400' : 'text-orange-400'}">{usageStats.queries}</span>
                </div>
                {!isPremium && <p className={`text-xs ${currentThemeConfig.textSecondary} mt-1`}>Upgrade for unlimited</p>}
              </div>
            </div>
          )}

          {/* Premium/Billing */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold px-1 block flex items-center gap-2 ${currentThemeConfig.textSecondary}`}>
              <CrownIcon className="h-3.5 w-3.5 text-yellow-400" /> PREMIUM
            </label>
            <button 
              onClick={onBilling}
              className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] border ${currentThemeConfig.border} active:scale-[0.98] ${
                isPremium 
                  ? `bg-gradient-to-r ${currentThemeConfig.gradient} text-white` 
                  : `${currentThemeConfig.bgSecondary} ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`
              }`}
            >
              {isPremium ? 'Manage Premium • Unlimited' : 'Upgrade to Premium'}
            </button>
          </div>

          {/* Account */}
          {!user ? (
            <div className="space-y-3">
              <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary}`}>ACCOUNT</label>
              <button className="group relative flex items-center justify-center w-full gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] bg-white text-gray-900 hover:bg-gray-100 shadow-md">
                <GoogleIcon className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary}`}>ACCOUNT</label>
              <button className={`group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`}>
                <div className="flex items-center gap-3">
                  <ShieldIcon className="h-4 w-4" />
                  <span>Privacy & Security</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 rotate-270" />
              </button>
              <button 
                onClick={onBilling}
                className={`group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="h-4 w-4" />
                  <span>Billing & Plans</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 rotate-270" />
              </button>
              <button className={`group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`}>
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-4 w-4" />
                  <span>Team Management</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 rotate-270" />
              </button>
              <button className={`group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} hover:bg-red-900/30 hover:text-red-400`}>
                <div className="flex items-center gap-3">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span>Help & Support</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 rotate-270" />
              </button>
              <button 
                onClick={onSignOut}
                className={`group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} hover:bg-red-900/30 hover:text-red-400`}
              >
                <div className="flex items-center gap-3">
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 rotate-270" />
              </button>
            </div>
          )}

          {/* Edit Profile */}
          {isEditing ? (
            <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-1 duration-300">
              <div className="space-y-2">
                <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary}`}>NAME</label>
                <input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className={`w-full rounded-xl p-3 text-sm focus:ring-2 transition-all duration-300 touch-manipulation min-h-[44px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:ring-purple-400/30`} 
                />
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-semibold px-1 block ${currentThemeConfig.textSecondary}`}>EMAIL</label>
                <input 
                  type="email"
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  className={`w-full rounded-xl p-3 text-sm focus:ring-2 transition-all duration-300 touch-manipulation min-h-[44px] ${currentThemeConfig.bgSecondary} border ${currentThemeConfig.border} ${currentThemeConfig.text} focus:ring-purple-400/30`} 
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                <button onClick={handleCancel} className={`relative flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] w-full sm:w-auto ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover} active:scale-[0.98]`}>
                  <XIcon className="h-4 w-4" /> Cancel
                </button>
                <button onClick={handleSave} className="relative flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation active:scale-[0.98] min-h-[44px] w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg">
                  <CheckIcon className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 animate-in slide-in-from-bottom-1 duration-300">
              <button className={`group relative flex items-center justify-center w-full gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden touch-manipulation active:scale-[0.98] min-h-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`}>
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

const SidebarComponent: React.FC<SidebarProps> = ({ 
  onNewChat, 
  isOpen, 
  onClose, 
  theme, 
  setTheme, 
  highlightTheme, 
  setHighlightTheme, 
  currentView, 
  onViewChange, 
  isMobile, 
  user, 
  onSignOut,
  onBilling,
  usageStats 
}) => {
  const handleNewChatClick = () => {
    onNewChat();
    onViewChange('chat');
    if (isMobile) onClose();
  };
  
  const currentThemeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;
  
  return (
    <aside className={`p-4 flex flex-col h-full border-r transition-all duration-300 ease-out fixed w-72 top-0 left-0 z-40 md:flex md:static md:w-72 md:translate-x-0 ${currentThemeConfig.bg} ${currentThemeConfig.border} shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10 pb-4 border-b ${currentThemeConfig.border}">
        <div className="flex items-center gap-3">
          <div className="relative p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg">
            <div className={`p-2 ${theme === 'light' ? 'bg-white' : 'bg-zinc-950'} rounded-full`}>
              <img 
                src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
                alt="AJ Studioz" 
                className="h-5 w-5 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-wide transition-all duration-300 relative z-10 ${currentThemeConfig.text}">AJ STUDIOZ</h1>
        </div>
        <button onClick={onClose} className={`md:hidden group relative transition-all duration-300 p-2 rounded-xl touch-manipulation active:scale-[0.95] min-h-[44px] min-w-[44px] ${currentThemeConfig.textSecondary} ${currentThemeConfig.hover}`}>
          <XIcon className="h-5 w-5 relative z-10" />
        </button>
      </div>

      {/* New Chat Button */}
      <button 
        onClick={handleNewChatClick}
        className={`group relative flex items-center justify-center w-full gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg touch-manipulation active:scale-[0.98] min-h-[48px] text-white ${currentThemeConfig.bgSecondary} ${currentThemeConfig.border} ${currentThemeConfig.hover}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <ZapIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-yellow-400 animate-pulse" />
          </div>
          <span className="relative z-10">New Design Chat</span>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-grow space-y-1 relative z-10 mb-6">
        <SidebarNavItem 
          icon={<SearchIcon className="h-4 w-4" />} 
          label="Explore Templates" 
          onClick={() => onViewChange('explore')}
          isActive={currentView === 'explore'}
          premium
          badge="Pro"
          theme={theme}
        />
        <SidebarNavItem 
          icon={<HistoryIcon className="h-4 w-4" />} 
          label="Design History" 
          onClick={() => onViewChange('history')}
          isActive={currentView === 'history'}
          theme={theme}
        />
        {user && (
          <SidebarNavItem 
            icon={<BarChartIcon className="h-4 w-4" />} 
            label="Analytics" 
            onClick={() => onViewChange('analytics')}
            isActive={currentView === 'analytics'}
            premium={isPremium}
            theme={theme}
          />
        )}
      </nav>

      <ProfileSettings
        theme={theme}
        setTheme={setTheme}
        highlightTheme={highlightTheme}
        setHighlightTheme={setHighlightTheme}
        user={user}
        onSignOut={onSignOut}
        usageStats={usageStats}
        onBilling={onBilling}
      />
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent);
