// components/TypingIndicator.tsx
import React from 'react';

const TypingIndicatorComponent: React.FC = () => {
  return (
    <div className="flex items-center gap-2 py-2 animate-in fade-in duration-300">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
        <div className="relative w-6 h-6 bg-black rounded-full border border-zinc-700/50 flex items-center justify-center">
          <img 
            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
            alt="AJ Studioz Logo" 
            className="h-4 w-4 rounded-full object-cover animate-pulse"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce"></span>
      </div>
      <span className="text-sm text-zinc-600 dark:text-zinc-400 italic">AJ is thinking...</span>
    </div>
  );
};

export const TypingIndicator = React.memo(TypingIndicatorComponent);
