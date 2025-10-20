'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    // Check device types
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsAndroid(android);

    // Check if already running as PWA
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Track visits for showing prompt
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());
    
    // Show after 2 visits or immediately on mobile
    if (visitCount >= 1 || iOS || android) {
      setHasVisited(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // For mobile devices, show install hint even if beforeinstallprompt doesn't fire
    const timer = setTimeout(() => {
      if ((iOS || android) && !standalone && hasVisited && !sessionStorage.getItem('pwa-prompt-dismissed')) {
        setShowPrompt(true);
      }
    }, 3000); // Show after 3 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      clearTimeout(timer);
    };
  }, [hasVisited]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed as PWA
  if (isStandalone) {
    return null;
  }

  // Show install prompt if: has deferredPrompt OR is mobile device OR has visited before
  const shouldShow = 
    showPrompt || 
    (hasVisited && (isIOS || isAndroid) && !sessionStorage.getItem('pwa-prompt-dismissed'));

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>

        <div className="flex items-start space-x-3">
          {/* App Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AJ</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              📱 Install AJ STUDIOZ App
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isIOS 
                ? '1. Tap the Share button (↗️) \n2. Select "Add to Home Screen" \n3. Tap "Add"'
                : isAndroid 
                  ? 'Add to your home screen for the full app experience!'
                  : 'Get the full app experience with offline access'
              }
            </p>
            
            {deferredPrompt && !isIOS && (
              <button
                onClick={handleInstallClick}
                className="mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-medium px-4 py-2 rounded-md transition-all shadow-lg"
              >
                <Download size={14} />
                <span>Install App</span>
              </button>
            )}
            
            {isAndroid && !deferredPrompt && (
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                💡 Look for "Add to Home Screen" in your browser menu (⋮)
              </div>
            )}
          </div>
        </div>

        {isIOS && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z"/>
              </svg>
              <span className="text-xs font-semibold">Safari Installation Guide</span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>• Tap the <strong>Share</strong> button at the bottom</div>
              <div>• Scroll down and tap <strong>"Add to Home Screen"</strong></div>
              <div>• Tap <strong>"Add"</strong> to install</div>
            </div>
          </div>
        )}
        
        {isAndroid && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 mb-2">
              <Download size={14} />
              <span className="text-xs font-semibold">Chrome Installation</span>
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              {deferredPrompt 
                ? "Use the install button above or browser menu (⋮)"
                : "Tap menu (⋮) → 'Add to Home screen' or 'Install app'"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}