// PWA utilities for service worker registration and management
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Wait for the page to load
      await new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(void 0);
        } else {
          window.addEventListener('load', () => resolve(void 0));
        }
      });

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered successfully:', registration.scope);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('🔄 New Service Worker found, installing...');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New content available, refresh to update');
              // Optionally show a notification to the user
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Service Workers not supported in this browser');
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('🗑️ All service workers unregistered');
    } catch (error) {
      console.error('❌ Error unregistering service workers:', error);
    }
  }
};

export const checkForPWAUpdate = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('🔍 Checked for PWA updates');
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
    }
  }
};