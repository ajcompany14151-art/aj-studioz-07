// components/CodeBlock.tsx (Enhanced with more features like line highlighting, search)
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

// Icons (reuse previous definitions)
const WrapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const RunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const EyeIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const DownloadIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const FullscreenIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

declare var hljs: any;

interface CodeBlockProps {
  language: string;
  code: string;
  theme?: string;
  onLineHighlight?: (line: number) => void;
}

const CodeActionButton: React.FC<{ 
  onClick?: () => void; 
  disabled?: boolean; 
  children: React.ReactNode; 
  label: string; 
  isActive?: boolean;
  theme?: string;
}> = ({ onClick, disabled, children, label, isActive = false, theme = 'dark' }) => {
  const config = theme === 'light' ? { bg: 'bg-gray-100', hover: 'hover:bg-gray-200', active: 'bg-gray-300' } : { bg: 'bg-zinc-900', hover: 'hover:bg-zinc-800', active: 'bg-zinc-700' };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-all duration-300 ease-in-out text-zinc-500 min-w-[36px] h-[32px] relative overflow-hidden group
      ${disabled ? 'cursor-not-allowed opacity-50' : `${config.hover} hover:text-white active:scale-95`}
      ${isActive ? `${config.active} text-white` : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
      <div className="relative z-10">{children}</div>
    </button>
  );
};

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

const COLLAPSE_THRESHOLD = 20;

const CodeBlockComponent: React.FC<CodeBlockProps> = ({ language, code, theme = 'dark', onLineHighlight }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const codeRef = useRef<HTMLElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const isCollapsible = lines.length > COLLAPSE_THRESHOLD;
  
  // Enhanced search in code
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const newHighlights: number[] = [];
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          newHighlights.push(index + 1);
        }
      });
      setHighlightedLines(newHighlights);
      onLineHighlight?.(newHighlights[0] || 0);
    } else {
      setHighlightedLines([]);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${language || 'txt'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const toggleFullscreen = useCallback(() => setIsFullscreen(!isFullscreen), [isFullscreen]);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className={`rounded-2xl my-4 overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/50 shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''} transition-all duration-500`}>
      {/* Enhanced header with search */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 backdrop-blur-2xl border-b border-zinc-700/50 text-zinc-400 text-xs font-mono relative">
        <span className="tracking-tight text-zinc-300 font-semibold flex items-center gap-2">
          <span className="px-2 py-0.5 bg-zinc-800/50 rounded-md text-xs">{language.toLowerCase()}</span>
          {isCollapsible && <span className="text-xs opacity-60">({lines.length} lines)</span>}
        </span>
        <div className="flex items-center gap-1">
          {/* Search input */}
          <div className="relative">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search code..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-7 pr-2 py-1 bg-zinc-800/50 border border-zinc-600 rounded-lg text-xs text-white placeholder-zinc-500 w-32 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
          <CodeActionButton onClick={() => setWordWrap(!wordWrap)} label={wordWrap ? "Disable wrap" : "Wrap"} isActive={wordWrap} theme={theme}>
            <WrapIcon className="h-4 w-4" />
          </CodeActionButton>
          <CodeActionButton onClick={handleDownload} label="Download" theme={theme}>
            <DownloadIconComponent className="h-4 w-4" />
          </CodeActionButton>
          <CodeActionButton onClick={() => setShowLineNumbers(!showLineNumbers)} label={showLineNumbers ? "Hide lines" : "Show lines"} theme={theme}>
            {showLineNumbers ? <EyeOffIconComponent className="h-4 w-4" /> : <EyeIconComponent className="h-4 w-4" />}
          </CodeActionButton>
          <CodeActionButton onClick={toggleFullscreen} label="Fullscreen" theme={theme}>
            <FullscreenIconComponent className="h-4 w-4" />
          </CodeActionButton>
          <CopyCodeButton isCopied={isCopied} onCopy={handleCopy} />
        </div>
      </div>
      
      <div ref={codeContainerRef} className={`relative ${isFullscreen ? 'flex-grow overflow-hidden' : ''}`}>
        <div className={`
          overflow-auto transition-all duration-500
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-zinc-900
          [&::-webkit-scrollbar-thumb]:rounded-full bg-zinc-700/40 hover:bg-zinc-600/60
          ${isExpanded ? (isFullscreen ? 'h-full' : 'max-h-[70vh]') : 'max-h-[300px]'}
          ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}
        `}>
          <div className="p-4 text-sm font-mono flex min-h-[20px]">
            {showLineNumbers && (
              <div className="select-none text-right text-zinc-500 pr-4 leading-relaxed mr-2 border-r border-zinc-700/50 min-w-[3.5rem] relative">
                {lines.map((_, i) => (
                  <div 
                    key={i} 
                    className={`cursor-pointer hover:bg-purple-500/20 transition-colors ${highlightedLines.includes(i + 1) ? 'bg-yellow-500/20 text-yellow-400' : ''}`}
                    onClick={() => onLineHighlight?.(i + 1)}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <pre className="p-0 m-0 leading-relaxed flex-1 overflow-visible">
              <code ref={codeRef} className={`language-${language.toLowerCase()} [&.hljs]:bg-transparent`}>
                {code}
              </code>
            </pre>
          </div>
        </div>

        {!isExpanded && isCollapsible && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
        )}
      </div>

      {isCollapsible && (
        <div className="bg-black/80 backdrop-blur-2xl border-t border-zinc-700/50 px-4 py-3 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-300 group"
          >
            {isExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUpIconComponent className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </>
            ) : (
              <>
                <span>Expand</span>
                <ChevronDownIconComponent className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
      
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex items-center justify-center p-4">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
