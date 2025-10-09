// components/TypingIndicator.tsx (Enhanced with corporate branding)
import React from 'react';

const TypingIndicator: React.FC<{ theme?: string }> = ({ theme = 'dark' }) => {
  const config = theme === 'light' ? { dot: 'bg-gray-500', text: 'text-gray-500' } : { dot: 'bg-purple-500', text: 'text-zinc-400' };
  
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
          <img 
            src="https://z-cdn-media.chatglm.cn/files/079b3e92-abfc-4ae5-84aa-f3fb926bfc5c_pasted_image_1759679553935.jpg?auth_key=1791215623-bec51edb33d145949cd4eb868c03460f-0-0dc6f9ab62e0f657961e3774e4e8173e" 
            alt="AJ Studioz" 
            className="h-6 w-6 rounded-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-ping opacity-50"></div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 ${config.dot} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2.5 h-2.5 ${config.dot} rounded-full animate-bounce`} style={{ animationDelay: '200ms' }}></div>
        <div className={`w-2.5 h-2.5 ${config.dot} rounded-full animate-bounce`} style={{ animationDelay: '400ms' }}></div>
      </div>
      <span className={`text-sm font-semibold ${config.text} animate-pulse`}>AJ Studioz is crafting your design...</span>
    </div>
  );
};

export default TypingIndicator;
