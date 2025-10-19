'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Hide splash screen after animation completes
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300); // Fade out duration
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-100 rotate-0' : 'scale-110 rotate-12'}`}>
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center">
                <Image
                  src="/logo.jpg"
                  alt="AJ STUDIOZ Logo"
                  width={120}
                  height={120}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className={`text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-1000 ${
          isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-90'
        }`}>
          AJ STUDIOZ
        </h1>
        
        {/* Tagline */}
        <p className={`mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 transition-all duration-1000 delay-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-80'
        }`}>
          AI Chat Assistant
        </p>

        {/* Loading Animation */}
        <div className={`mt-8 flex justify-center transition-all duration-1000 delay-500 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-60'
        }`}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Version Badge */}
        <div className={`mt-6 transition-all duration-1000 delay-700 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-40'
        }`}>
          <span className="inline-block px-4 py-2 bg-black/10 dark:bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
            v3.1.0 PWA
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}