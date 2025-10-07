// components/CodeBlock.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { WrapIcon, RunIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeOffIcon, DownloadIcon, FullscreenIcon } from './icons/CustomIcons';

// This informs TypeScript that 'hljs' is a global variable provided by the script in index.html
declare var hljs: any;

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeActionButton: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; label: string; isActive?: boolean }> = ({ onClick, disabled, children, label, isActive = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-all duration-300 ease-in-out text-zinc-500 min-w-[36px] h-[32px] relative overflow-hidden group
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-900/50 hover:text-white active:scale-95'}
        ${isActive ? 'bg-zinc-800/50 text-white' : ''}`}
        onTouchStart={(e) => !disabled && e.preventDefault()}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
        <div className="relative z-10">{children}</div>
    </button>
);

const CopyCodeButton: React.FC<{ isCopied: boolean; onCopy: () => void }> = ({ isCopied, onCopy }) => (
    <button 
        onClick={onCopy} 
        aria-label={isCopied ? "Copied to clipboard" : "Copy code"}
        title={isCopied ? "Copied to clipboard" : "Copy code"}
        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-in-out text-sm w-[88px] h-[32px] relative overflow-hidden group
        ${isCopied
            ? 'bg-emerald-900/50 text-emerald-400 shadow-lg shadow-emerald-700/30'
            : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-white'
        }`}
        onTouchStart={(e) => e.preventDefault()}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, language]);

  const handleRunCode = useCallback(() => {
    // This would typically open a new window or iframe with the code running
    // For now, we'll just log it
    console.log('Running code:', code);
  }, [code]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleWordWrap = useCallback(() => {
    setWordWrap(!wordWrap);
  }, [wordWrap]);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Enhancement: Toggle line numbers
  const toggleLineNumbers = () => setShowLineNumbers(!showLineNumbers);

  return (
    <>
      <div className={`rounded-2xl my-4 overflow-hidden bg-gradient-to-b from-black to-zinc-950 border border-zinc-700/30 shadow-2xl shadow-black/40 hover:shadow-3xl hover:shadow-purple-500/20 transition-all duration-500 animate-float-glow ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}`}>
        <div className="flex justify-between items-center px-4 py-3 bg-black/80 backdrop-blur-2xl border-b border-zinc-700/30 text-zinc-400 text-xs font-mono">
          <span className="tracking-tight text-zinc-300 font-semibold flex items-center gap-2">
            <span className="px-2 py-0.5 bg-zinc-800/50 rounded-md text-xs">{language.toLowerCase()}</span>
            {isCollapsible && (
              <span className="text-xs opacity-60">({lines.length} lines)</span>
            )}
          </span>
          <div className="flex items-center gap-1">
              <CodeActionButton onClick={toggleWordWrap} label={wordWrap ? "Disable word wrap" : "Enable word wrap"} isActive={wordWrap}>
                  <WrapIcon className="h-4 w-4" />
              </CodeActionButton>
              <CodeActionButton onClick={handleRunCode} label="Run code (coming soon)">
                  <RunIcon className="h-4 w-4" />
              </CodeActionButton>
              <CodeActionButton onClick={toggleLineNumbers} label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}>
                {showLineNumbers ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </CodeActionButton>
              <CodeActionButton onClick={handleDownload} label="Download code">
                  <DownloadIcon className="h-4 w-4" />
              </CodeActionButton>
              <CodeActionButton onClick={toggleFullscreen} label="Toggle fullscreen">
                  <FullscreenIcon className="h-4 w-4" />
              </CodeActionButton>
              <CopyCodeButton isCopied={isCopied} onCopy={handleCopy} />
          </div>
        </div>
        
        <div ref={codeContainerRef} className={`relative ${isFullscreen ? 'flex-grow overflow-hidden' : ''}`}>
          <div className={`
            overflow-auto transition-all duration-500 ease-in-out
            [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-black/50
            [&::-webkit-scrollbar-thumb]:rounded-full bg-zinc-700/40
            [&::-webkit-scrollbar-thumb]:transition-colors
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600/60
            ${isExpanded ? (isFullscreen ? 'h-full' : 'max-h-[60vh]') : 'max-h-[280px]'}
            ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}
          `}>
            <div className="p-4 text-sm font-mono flex min-h-[20px]">
              {showLineNumbers && (
                <div aria-hidden={!showLineNumbers} className="select-none text-right text-zinc-500 pr-4 leading-relaxed mr-2 border-r border-zinc-700/30 min-w-[3rem]">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
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
          <div className="bg-black/80 backdrop-blur-2xl border-t border-zinc-700/30 px-4 py-3 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-300 group"
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
      
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex items-center justify-center p-4">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-300"
            aria-label="Exit fullscreen"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
