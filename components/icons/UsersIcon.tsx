// components/icons/UsersIcon.tsx (New - for Team)
import React from 'react';

export const UsersIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);
