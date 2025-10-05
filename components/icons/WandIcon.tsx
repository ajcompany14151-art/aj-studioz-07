import React from 'react';

export const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M12.5 7.5h-1" />
    <path d="M17.5 7.5h-1" />
    <path d="m15 14-1-1" />
    <path d="m18 17-1-1" />
    <path d="m12 22 3-3" />
    <path d="m6 16 3-3" />
    <path d="M22 12l-3-3" />
    <path d="M10 6 7 3" />
    <path d="M3 21 21 3" />
  </svg>
);