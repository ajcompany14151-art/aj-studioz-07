'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Share,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
  Sparkles,
  Code,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface CodeBlockProps {
  language?: string
  children: string
  fileName?: string
}

interface GrokResponseProps {
  content: string
  isStreaming?: boolean
  onFeedback?: (type: 'up' | 'down') => void
  onCopy?: () => void
  showActions?: boolean
  timestamp?: Date
  model?: string
}

// Custom Code Block Component with Grok styling
function CodeBlock({ language = 'text', children, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguageColor = (lang: string): string => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-orange-500',
      csharp: 'bg-purple-500',
      cpp: 'bg-blue-600',
      rust: 'bg-orange-600',
      go: 'bg-cyan-500',
      php: 'bg-indigo-500',
      ruby: 'bg-red-500',
      html: 'bg-orange-400',
      css: 'bg-pink-500',
      sql: 'bg-blue-400',
      json: 'bg-gray-500',
      yaml: 'bg-red-400',
      bash: 'bg-gray-600',
      shell: 'bg-gray-600'
    }
    return colors[lang.toLowerCase()] || 'bg-gray-500'
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800/50 bg-[#0d1117] shadow-2xl">
      {/* Header with file name and language */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {fileName && (
            <div className="flex items-center gap-2 text-gray-300">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">{fileName}</span>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(language)}`} />
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                {language}
              </span>
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700/50"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={children.split('\n').length > 5}
          wrapLines={true}
          wrapLongLines={true}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

// Enhanced List Component
function EnhancedList({ children, ordered = false }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  
  return (
    <Tag className={`space-y-2 ${ordered ? 'list-decimal' : 'list-none'} pl-0`}>
      {React.Children.map(children, (child, index) => (
        <li className="flex items-start gap-3 text-gray-200 leading-relaxed">
          {!ordered && (
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2.5" />
          )}
          <div className="flex-1">{child}</div>
        </li>
      ))}
    </Tag>
  )
}

// Collapsible Section Component
function CollapsibleSection({ title, children, defaultOpen = false }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-700/50 rounded-xl bg-gray-900/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 transition-colors"
      >
        <span className="font-medium text-gray-200">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-700/50">
          {children}
        </div>
      )}
    </div>
  )
}

// Alert/Callout Component
function AlertCallout({ type, children }: { 
  type: 'info' | 'warning' | 'success' | 'error' | 'tip'
  children: React.ReactNode 
}) {
  const configs = {
    info: {
      icon: Info,
      className: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
      iconColor: 'text-blue-400'
    },
    warning: {
      icon: AlertCircle,
      className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
      iconColor: 'text-yellow-400'
    },
    success: {
      icon: CheckCircle,
      className: 'border-green-500/30 bg-green-500/10 text-green-200',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      className: 'border-red-500/30 bg-red-500/10 text-red-200',
      iconColor: 'text-red-400'
    },
    tip: {
      icon: Lightbulb,
      className: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
      iconColor: 'text-purple-400'
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className={`flex gap-3 p-4 border-l-4 rounded-r-lg ${config.className} my-4`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function GrokResponse({
  content,
  isStreaming = false,
  onFeedback,
  onCopy,
  showActions = true,
  timestamp,
  model = 'AJ Studioz AI'
}: GrokResponseProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type)
    onFeedback?.(type)
  }

  // Custom markdown components
  const components = {
    // Code blocks
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      if (!inline && language) {
        return (
          <CodeBlock language={language} fileName={props.filename}>
            {String(children).replace(/\n$/, '')}
          </CodeBlock>
        )
      }
      
      return (
        <code 
          className="px-1.5 py-0.5 bg-gray-800/60 text-blue-300 rounded text-sm font-mono border border-gray-700/50"
          {...props}
        >
          {children}
        </code>
      )
    },

    // Enhanced headings
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-blue-400" />
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-white mb-4 mt-8 flex items-center gap-2 border-b border-gray-700/50 pb-2">
        <Zap className="w-6 h-6 text-purple-400" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6">
        {children}
      </h3>
    ),

    // Enhanced paragraphs
    p: ({ children }: any) => (
      <p className="text-gray-300 leading-relaxed mb-4 text-[15px]">
        {children}
      </p>
    ),

    // Enhanced lists
    ul: ({ children }: any) => (
      <EnhancedList>{children}</EnhancedList>
    ),
    ol: ({ children }: any) => (
      <EnhancedList ordered>{children}</EnhancedList>
    ),
    li: ({ children }: any) => children,

    // Enhanced blockquotes
    blockquote: ({ children }: any) => (
      <div className="border-l-4 border-blue-500/50 bg-gray-900/40 pl-4 py-2 my-4 italic text-gray-300">
        {children}
      </div>
    ),

    // Enhanced tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse bg-gray-900/30 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-600/50 bg-gray-800/50 px-4 py-2 text-left font-semibold text-gray-200">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-600/50 px-4 py-2 text-gray-300">
        {children}
      </td>
    ),

    // Enhanced links
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50 hover:decoration-blue-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Custom components for special syntax
    // Usage: > [!INFO] This is an info callout
    // Usage: > [!WARNING] This is a warning
    div: ({ className, children }: any) => {
      if (className === 'callout') {
        const firstChild = React.Children.toArray(children)[0]
        if (React.isValidElement(firstChild) && firstChild.props.children) {
          const text = firstChild.props.children.toString()
          if (text.startsWith('[!INFO]')) {
            return <AlertCallout type="info">{text.replace('[!INFO]', '')}</AlertCallout>
          }
          if (text.startsWith('[!WARNING]')) {
            return <AlertCallout type="warning">{text.replace('[!WARNING]', '')}</AlertCallout>
          }
          if (text.startsWith('[!SUCCESS]')) {
            return <AlertCallout type="success">{text.replace('[!SUCCESS]', '')}</AlertCallout>
          }
          if (text.startsWith('[!ERROR]')) {
            return <AlertCallout type="error">{text.replace('[!ERROR]', '')}</AlertCallout>
          }
          if (text.startsWith('[!TIP]')) {
            return <AlertCallout type="tip">{text.replace('[!TIP]', '')}</AlertCallout>
          }
        }
      }
      return <div className={className}>{children}</div>
    }
  }

  return (
    <div className="relative group">
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm shadow-2xl">
        {/* Header with model info and timestamp */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-700/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {isStreaming && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-200">{model}</div>
              {timestamp && (
                <div className="text-xs text-gray-400">
                  {timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white h-8 px-2"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFeedback('up')}
                className={`h-8 px-2 ${
                  feedback === 'up' 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-gray-400 hover:text-green-400'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFeedback('down')}
                className={`h-8 px-2 ${
                  feedback === 'down' 
                    ? 'text-red-400 bg-red-400/10' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white h-8 px-2"
              >
                <Share className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={components}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 mt-4 text-gray-400">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Example usage component
export function ExampleGrokResponse() {
  const sampleContent = `# Welcome to AJ Studioz AI! ✨

I'm here to help you build amazing projects with advanced capabilities. Let me show you what I can do:

## 🚀 Advanced Features

Here's some **JavaScript** code to get you started:

\`\`\`javascript
// Modern React component with TypeScript
import React, { useState, useEffect } from 'react'

interface UserProps {
  name: string
  age: number
}

const UserProfile: React.FC<UserProps> = ({ name, age }) => {
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    console.log(\`User \${name} is now active!\`)
    setIsActive(true)
  }, [name])

  return (
    <div className="user-profile">
      <h2>Hello, {name}!</h2>
      <p>You are {age} years old</p>
      <span className={isActive ? 'active' : 'inactive'}>
        Status: {isActive ? '🟢 Online' : '🔴 Offline'}
      </span>
    </div>
  )
}

export default UserProfile
\`\`\`

## 📊 Key Benefits

1. **3D Visualizations** - Interactive Three.js scenes
2. **Code Playground** - Sandboxed execution environment  
3. **Interactive Diagrams** - Mermaid & D3.js charts
4. **Smart PDF Generation** - Advanced templates
5. **Excel Integration** - Full spreadsheet capabilities

> [!TIP] Pro tip: Use the code playground to test your implementations live!

## 🎯 Quick Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| \`/3d\` | Create 3D visualization | Ctrl+3 |
| \`/chart\` | Generate interactive chart | Ctrl+C |
| \`/code\` | Open code playground | Ctrl+P |
| \`/pdf\` | Export to PDF | Ctrl+E |

> [!INFO] All features are integrated with PWA capabilities for offline access!

Want to see more? Just ask me to create any type of visualization, code, or document you need!`

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <GrokResponse
        content={sampleContent}
        timestamp={new Date()}
        model="AJ Studioz AI v3.1"
        onFeedback={(type) => console.log('Feedback:', type)}
        onCopy={() => console.log('Content copied!')}
      />
      
      <GrokResponse
        content="I'm still working on your request... 🤔"
        isStreaming={true}
        showActions={false}
        model="AJ Studioz AI v3.1"
      />
    </div>
  )
}