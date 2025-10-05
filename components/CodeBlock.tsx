import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RunIcon } from './icons/RunIcon';
import { WrapIcon } from './icons/WrapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { SparklesIcon } from './icons/SparklesIcon';

// This informs TypeScript that 'hljs' is a global variable provided by the script in index.html
declare var hljs: any;

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeActionButton: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; label: string; premium?: boolean }> = ({ onClick, disabled, children, label, premium = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`group relative flex items-center gap-1.5 p-2 rounded-lg transition-all duration-300 ease-out text-zinc-500 dark:text-zinc-400 
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-700/50'}
        ${premium ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300' : ''}
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:rounded-lg before:opacity-0 before:transition-all before:group-hover:opacity-100`}
    >
        <div className="relative z-10">
          {children}
        </div>
    </button>
);

const CopyCodeButton: React.FC<{ isCopied: boolean; onCopy: () => void }> = ({ isCopied, onCopy }) => (
    <button 
        onClick={onCopy} 
        aria-label={isCopied ? "Copied to clipboard" : "Copy code"}
        title={isCopied ? "Copied to clipboard" : "Copy code"}
        className={`group relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-sm w-[90px] overflow-hidden
        ${isCopied
          ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm shadow-emerald-200/30 dark:shadow-emerald-800/30'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-700/50'
        }
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/20 before:to-transparent before:opacity-0 before:transition-all before:group-hover:opacity-100`}
    >
        <div className="relative z-10 flex items-center justify-center gap-1.5">
          <div className="relative h-4 w-4" aria-hidden="true">
              <CopyIcon className={`h-full w-full transition-all duration-300 ease-out transform ${isCopied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
              <CheckIcon className={`h-full w-full absolute top-0 left-0 transition-all duration-300 ease-out transform ${isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
          </div>
          <div className="relative w-12 h-4 text-left overflow-hidden">
              <span className={`absolute inset-0 transition-all duration-300 ease-out transform flex items-center ${isCopied ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
                  Copy
              </span>
              <span className={`absolute inset-0 transition-all duration-300 ease-out transform flex items-center ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                  Copied!
              </span>
          </div>
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
    <div className={`rounded-2xl my-6 overflow-hidden bg-gradient-to-b from-zinc-50/80 to-white/80 dark:from-zinc-950/80 dark:to-black/80 border border-zinc-200/40 dark:border-zinc-700/40 shadow-lg shadow-zinc-200/20 dark:shadow-zinc-800/20 backdrop-blur-md`}>
      <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-zinc-100/70 to-zinc-50/70 dark:from-zinc-900/70 dark:to-zinc-800/70 backdrop-blur-sm border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-sans">
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-tight text-zinc-700 dark:text-zinc-300 font-semibold">{language.toLowerCase()}</span>
          <div className="h-2 w-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1">
            <CodeActionButton label="Wrap code (coming soon)" disabled premium={false}>
                <WrapIcon className="h-4 w-4" />
            </CodeActionButton>
            <CodeActionButton label="Run code (coming soon)" disabled premium={false}>
                <RunIcon className="h-4 w-4" />
            </CodeActionButton>
            <CodeActionButton label="Enhance with AI (coming soon)" disabled premium>
                <SparklesIcon className="h-4 w-4" />
            </CodeActionButton>
            <CopyCodeButton isCopied={isCopied} onCopy={handleCopy} />
        </div>
      </div>
      
      <div className="relative">
        <div className={`
          overflow-auto transition-all duration-500 ease-out
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/40 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/40
          [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600/60
          ${isExpanded ? 'max-h-[70vh]' : 'max-h-[300px]'}
        `}>
          <div className="p-4 text-sm font-mono flex relative">
            <div aria-hidden="true" className="select-none text-right text-zinc-400 dark:text-zinc-500 pr-4 leading-relaxed mr-2 border-r border-zinc-200/30 dark:border-zinc-700/30">
              {lines.map((_, i) => (
                <div key={i} className="text-xs">{i + 1}</div>
              ))}
            </div>
            <pre className="p-0 m-0 leading-relaxed flex-1">
              <code ref={codeRef} className={`language-${language.toLowerCase()} [&.hljs]:bg-transparent [&.hljs .hljs-keyword]:text-purple-600 [&.hljs .hljs-string]:text-green-600 [&.hljs .hljs-comment]:text-zinc-500 [&.hljs .hljs-number]:text-blue-600`}>
                {code.trimEnd()}
              </code>
            </pre>
          </div>
        </div>

        {!isExpanded && isCollapsible && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 dark:from-black/90 to-transparent pointer-events-none backdrop-blur-sm"></div>
        )}
      </div>

      {isCollapsible && (
        <div className="bg-gradient-to-r from-zinc-100/70 to-zinc-50/70 dark:from-zinc-900/70 dark:to-zinc-800/70 backdrop-blur-sm border-t border-zinc-200/50 dark:border-zinc-800/50 px-4 py-2 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="group flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:shadow-md hover:shadow-purple-200/50 dark:hover:shadow-purple-800/50 bg-white/50 dark:bg-black/50 rounded-lg px-3 py-1.5"
          >
            <span>{isExpanded ? 'Show Less' : 'Expand Code'}</span>
            {isExpanded ? <ChevronUpIcon className="h-4 w-4 group-hover:rotate-180 transition-transform" /> : <ChevronDownIcon className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
