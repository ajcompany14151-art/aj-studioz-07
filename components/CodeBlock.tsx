// components/CodeBlock.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RunIcon } from './icons/RunIcon';
import { WrapIcon } from './icons/WrapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon'; // Assume this icon exists or add it

// This informs TypeScript that 'hljs' is a global variable provided by the script in index.html
declare var hljs: any;

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeActionButton: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; label: string }> = ({ onClick, disabled, children, label }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`flex items-center gap-1.5 p-1.5 rounded-md transition-colors duration-200 ease-in-out text-zinc-500 dark:text-zinc-400 min-w-[36px] h-[32px]
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-700/50 hover:text-white active:scale-95'}`}
        onTouchStart={(e) => !disabled && e.preventDefault()} // Mobile enhancement
    >
        {children}
    </button>
);

const CopyCodeButton: React.FC<{ isCopied: boolean; onCopy: () => void }> = ({ isCopied, onCopy }) => (
    <button 
        onClick={onCopy} 
        aria-label={isCopied ? "Copied to clipboard" : "Copy code"}
        title={isCopied ? "Copied to clipboard" : "Copy code"}
        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 ease-in-out text-sm w-[88px] h-[32px] ${
            isCopied
            ? 'bg-emerald-900/50 text-emerald-400 shadow-md shadow-emerald-700/50'
            : 'text-zinc-500 hover:bg-zinc-700/50 hover:text-white'
        }`}
        onTouchStart={(e) => e.preventDefault()}
    >
        <div className="relative h-4 w-4" aria-hidden="true">
            <CopyIcon className={`h-full w-full transition-all duration-300 ease-in-out transform ${isCopied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
            <CheckIcon className={`h-full w-full absolute top-0 left-0 transition-all duration-300 ease-in-out transform ${isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
        </div>
        <div className="relative w-12 h-4 text-left overflow-hidden">
            <span className={`absolute inset-0 transition-all duration-300 ease-in-out transform flex items-center ${isCopied ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
                Copy
            </span>
            <span className={`absolute inset-0 transition-all duration-300 ease-in-out transform flex items-center ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                Copied
            </span>
        </div>
    </button>
);

const COLLAPSE_THRESHOLD = 15; // Lines

const CodeBlockComponent: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!code.split('\n').length > COLLAPSE_THRESHOLD);
  const codeRef = useRef<HTMLElement>(null);

  const lines = useMemo(() => code.trimEnd().split('\n'), [code]);
  const isCollapsible = useMemo(() => lines.length > COLLAPSE_THRESHOLD, [lines.length]);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [code]);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Enhancement: Toggle line numbers
  const toggleLineNumbers = () => setShowLineNumbers(!showLineNumbers);

  return (
    <div className={`rounded-xl my-4 overflow-hidden bg-gradient-to-b from-black to-zinc-950 border border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 text-zinc-400 text-xs font-sans">
        <span className="font-mono tracking-tight text-zinc-300 font-semibold flex items-center gap-2">
          <span>{language.toLowerCase()}</span>
          {isCollapsible && (
            <span className="text-xs opacity-60">({lines.length} lines)</span>
          )}
        </span>
        <div className="flex items-center gap-1">
            <CodeActionButton label="Wrap code (coming soon)" disabled>
                <WrapIcon className="h-4 w-4" />
            </CodeActionButton>
            <CodeActionButton label="Run code (coming soon)" disabled>
                <RunIcon className="h-4 w-4" />
            </CodeActionButton>
            <CodeActionButton onClick={toggleLineNumbers} label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}>
              {showLineNumbers ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </CodeActionButton>
            <CopyCodeButton isCopied={isCopied} onCopy={handleCopy} />
        </div>
      </div>
      
      <div className="relative">
        <div className={`
          overflow-auto transition-all duration-300 ease-in-out
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-zinc-900/30
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-zinc-700/40
          [&::-webkit-scrollbar-thumb]:transition-colors
          hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600/60
          ${isExpanded ? 'max-h-[60vh]' : 'max-h-[280px]'}
        `}>
          <div className="p-4 text-sm font-mono flex min-h-[20px]">
            {showLineNumbers && (
              <div aria-hidden={!showLineNumbers} className="select-none text-right text-zinc-500 pr-4 leading-relaxed mr-2 border-r border-zinc-800/50">
                {lines.map((_, i) => (
                  <div key={i} className="min-w-[3rem]">{i + 1}</div>
                ))}
              </div>
            )}
            <pre className="p-0 m-0 leading-relaxed flex-1 overflow-visible">
              <code ref={codeRef} className={`language-${language.toLowerCase()} [&.hljs]:bg-transparent break-words`}>
                {code.trimEnd()}
              </code>
            </pre>
          </div>
        </div>

        {!isExpanded && isCollapsible && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        )}
      </div>

      {isCollapsible && (
        <div className="bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800 px-4 py-2 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors group"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUpIcon className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDownIcon className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
