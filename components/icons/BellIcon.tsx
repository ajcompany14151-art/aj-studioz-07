// components/icons/BellIcon.tsx
import React from 'react';

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 0012 3a6 6 0 00-6 6v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0v2a3 3 0 11-6 0v-2m5.714 0h-3.714m-2.286 0h-3.714m5.714 0a3 3 0 11-6 0v-2" />
  </svg>
);

export { BellIcon };
