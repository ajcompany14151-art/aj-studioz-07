"use client";

import { useEffect } from "react";

/**
 * PWA Registration Component
 *
 * This component registers the service worker for Progressive Web App functionality.
 * It handles:
 * - Service worker registration on production
 * - Update detection and notification
 * - Error handling
 *
 * Usage: Import and render in app/layout.tsx
 */
export function PWARegister() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered:", registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60_000); // Check every minute

            // Handle updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available, notify user
                    console.log(
                      "[PWA] New version available! Refresh to update."
                    );
                    // You can show a toast notification here if desired
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
