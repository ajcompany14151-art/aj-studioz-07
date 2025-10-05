import React from 'react';

const TypingIndicatorComponent: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce"></span>
    </div>
  );
};

export const TypingIndicator = React.memo(TypingIndicatorComponent);