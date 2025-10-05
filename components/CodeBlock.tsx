import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RunIcon } from './icons/RunIcon';
import { WrapIcon } from './icons/WrapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

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
        className={`flex items-center gap-1.5 p-1.5 rounded-md transition-colors duration-200 ease-in-out text-zinc-500 dark:text-zinc-400 
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white'}`}
    >
        {children}
    </button>
);

const CopyCodeButton: React.FC<{ isCopied: boolean; onCopy: () => void }> = ({ isCopied, onCopy }) => (
    <button 
        onClick={onCopy} 
        aria-label={isCopied ? "Copied to clipboard" : "Copy code"}
        title={isCopied ? "Copied to clipboard" : "Copy code"}
        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 ease-in-out text-sm w-[88px] ${
            isCopied
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white'
        }`}
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
  const codeRef = useRef<HTMLElement>(null);

  const lines = useMemo(() => code.trimEnd().split('\n'), [code]);
  const isCollapsible = useMemo(() => lines.length > COLLAPSE_THRESHOLD, [lines.length]);
  
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [code]);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className={`rounded-xl my-4 overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black border border-zinc-300/60 dark:border-zinc-700/60`}>
      <div className="flex justify-between items-center px-4 py-1.5 bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-sans">
        <span className="font-mono tracking-tight text-zinc-700 dark:text-zinc-300 font-semibold">{language.toLowerCase()}</span>
        <div className="flex items-center gap-1">
            <CodeActionButton label="Wrap code (coming soon)" disabled>
                <WrapIcon className="h-4 w-4" />
            </CodeActionButton>
            <CodeActionButton label="Run code (coming soon)" disabled>
                <RunIcon className="h-4 w-4" />
            </CodeActionButton>
            <CopyCodeButton isCopied={isCopied} onCopy={handleCopy} />
        </div>
      </div>
      
      <div className="relative">
        <div className={`
          overflow-auto transition-all duration-300 ease-in-out
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-zinc-200/30 dark:[&::-webkit-scrollbar-track]:bg-zinc-800/30
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-zinc-300/40 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/40
          [&::-webkit-scrollbar-thumb]:transition-colors
          hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600/60
          ${isExpanded ? 'max-h-[60vh]' : 'max-h-[280px]'}
        `}>
          <div className="p-4 text-sm font-mono flex">
            <div aria-hidden="true" className="select-none text-right text-zinc-400 dark:text-zinc-500 pr-6 leading-relaxed">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="p-0 m-0 leading-relaxed flex-1">
              <code ref={codeRef} className={`language-${language.toLowerCase()} [&.hljs]:bg-transparent`}>
                {code.trimEnd()}
              </code>
            </pre>
          </div>
        </div>

        {!isExpanded && isCollapsible && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none"></div>
        )}
      </div>

      {isCollapsible && (
        <div className="bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 px-4 py-1.5 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);