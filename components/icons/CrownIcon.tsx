// components/icons/CrownIcon.tsx (New file to fix import error)
import React from 'react';

export const CrownIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.25l3 3-3 3-3-3 3-3zM6.75 12a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6zM18.75 12a.75.75 0 01-1.5 0v6a.75.75 0 011.5 0v-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.25L9.75 6a3.75 3.75 0 00-7.5 0L3 9.75a3.75 3.75 0 007.5 0L12 8.25zm6 0l-2.25-2.25a3.75 3.75 0 00-7.5 0L12 8.25z" />
  </svg>
);
