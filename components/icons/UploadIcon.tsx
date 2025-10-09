// components/icons/UploadIcon.tsx (Fixed - complete upload icon)
import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12a2 2 0 10-4V8a2 2 0 100 4v8a2 2 0 10 4 0z" />
  </svg>
);
