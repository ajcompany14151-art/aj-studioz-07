'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Share,
  Lightbulb,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
  Sparkles,
  Code
} from 'lucide-react'

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
  isUser?: boolean
  userAvatar?: string
}

interface UserMessageProps {
  content: string
  timestamp?: Date
  avatar?: string
}

// Enhanced Code Block Component with HTML Preview
function CodeBlock({ language = 'text', children, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getLanguageColor = (lang: string): string => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      html: 'bg-orange-400',
      css: 'bg-pink-500',
      json: 'bg-gray-500',
      bash: 'bg-gray-600'
    }
    return colors[lang.toLowerCase()] || 'bg-gray-500'
  }

  const canPreview = language.toLowerCase() === 'html'

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-800/80 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/60 border-b border-gray-600/40">
        <div className="flex items-center gap-2">
          {fileName && (
            <div className="flex items-center gap-2 text-gray-300">
              <Code className="w-3 h-3" />
              <span className="text-xs font-medium">{fileName}</span>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(language)} shadow-sm`} />
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                {language}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-1.5 rounded text-xs font-medium transition-all ${
                showPreview 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                  : 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10'
              }`}
            >
              {showPreview ? 'Code' : 'Preview'}
            </button>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="relative">
          {showPreview && canPreview ? (
            <div className="bg-white">
              <iframe
                srcDoc={children}
                className="w-full h-64 border-0"
                title="HTML Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <pre className="p-4 text-sm text-gray-200 font-mono leading-relaxed bg-gray-900/20">
                <code className="language-{language}">{children}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Enhanced List Component
function EnhancedList({ children, ordered = false }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  
  return (
    <Tag className={`space-y-1 ${ordered ? 'list-decimal list-inside' : 'list-disc list-inside'} pl-4 text-gray-200`}>
      {children}
    </Tag>
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
  model = 'AJ Studioz AI',
  isUser = false,
  userAvatar
}: GrokResponseProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  // If it's a user message, render the user component
  if (isUser) {
    return <UserMessage content={content} timestamp={timestamp} avatar={userAvatar} />
  }

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

  // Format content with simple markdown-like rendering
  const formatContent = (content: string) => {
    // Simple markdown parsing for mobile-optimized display
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let inCodeBlock = false
    let codeBlockContent = ''
    let codeBlockLang = ''

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <CodeBlock key={index} language={codeBlockLang}>
              {codeBlockContent.trim()}
            </CodeBlock>
          )
          inCodeBlock = false
          codeBlockContent = ''
        } else {
          inCodeBlock = true
          codeBlockLang = line.slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n'
        return
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl sm:text-3xl font-bold text-white mb-4 mt-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:w-6 text-blue-400 flex-shrink-0" />
            {line.slice(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-bold text-white mb-3 mt-6 flex items-center gap-2 border-b border-gray-700/50 pb-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
            {line.slice(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg sm:text-xl font-semibold text-gray-200 mb-2 mt-4">
            {line.slice(4)}
          </h3>
        )
      }
      // Inline code
      else if (line.includes('`')) {
        const parts = line.split('`')
        const formatted = parts.map((part, i) => 
          i % 2 === 0 ? part : 
          <code key={i} className="px-1 py-0.5 bg-gray-800/60 text-blue-300 rounded text-sm font-mono">
            {part}
          </code>
        )
        elements.push(
          <p key={index} className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
            {formatted}
          </p>
        )
      }
      // Lists
      else if (line.match(/^[\s]*[-*+]\s/)) {
        elements.push(
          <li key={index} className="text-gray-200 mb-1 ml-4 list-disc list-inside text-sm sm:text-base">
            {line.replace(/^[\s]*[-*+]\s/, '')}
          </li>
        )
      }
      // Numbered lists
      else if (line.match(/^[\s]*\d+\.\s/)) {
        elements.push(
          <li key={index} className="text-gray-200 mb-1 ml-4 list-decimal list-inside text-sm sm:text-base">
            {line.replace(/^[\s]*\d+\.\s/, '')}
          </li>
        )
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        const alertMatch = line.match(/^>\s*\[!(INFO|WARNING|SUCCESS|ERROR|TIP)\]\s*(.*)$/)
        if (alertMatch) {
          const [, type, message] = alertMatch
          elements.push(
            <AlertCallout key={index} type={type.toLowerCase() as any}>
              {message}
            </AlertCallout>
          )
        } else {
          elements.push(
            <blockquote key={index} className="border-l-4 border-blue-500/50 bg-gray-900/40 pl-3 py-2 my-3 italic text-gray-300 text-sm sm:text-base">
              {line.slice(2)}
            </blockquote>
          )
        }
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={index} className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
            {line}
          </p>
        )
      }
    })

  return elements
  }

// User Message Component - Exported for standalone use
export function UserMessage({ content, timestamp, avatar }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 py-3 shadow-lg">
          <p className="text-white text-sm sm:text-base leading-relaxed">
            {content}
          </p>
          {timestamp && (
            <div className="text-xs text-blue-200/70 mt-1 text-right">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt="User" 
              className="w-8 h-8 rounded-full border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="relative group w-full">
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50 shadow-lg mx-auto max-w-4xl">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700/50 bg-gray-800/20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              {isStreaming && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-200 text-sm sm:text-base truncate">{model}</div>
              {timestamp && (
                <div className="text-xs text-gray-400 hidden sm:block">
                  {timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  feedback === 'up' 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-gray-400 hover:text-green-400 hover:bg-gray-700/50'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  feedback === 'down' 
                    ? 'text-red-400 bg-red-400/10' 
                    : 'text-gray-400 hover:text-red-400 hover:bg-gray-700/50'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Content - Mobile optimized */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="max-w-none">
            {formatContent(content)}
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 mt-3 text-gray-400">
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
  const htmlContent = `Here's a simple HTML page with preview:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Webpage</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            text-align: center;
        }
        .btn {
            background: #ff6b6b;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to My Website!</h1>
        <p>This is a beautiful webpage with modern styling.</p>
        <button class="btn" onclick="alert('Hello from AJ Studioz AI!')">Click Me!</button>
        <div style="margin-top: 30px;">
            <h3>Features:</h3>
            <ul style="text-align: left; display: inline-block;">
                <li>Responsive design</li>
                <li>Modern CSS effects</li>
                <li>Interactive elements</li>
                <li>Beautiful gradients</li>
            </ul>
        </div>
    </div>
</body>
</html>
\`\`\`

> [!TIP] Click the "Preview" button above to see the HTML rendered live!`

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-3 sm:p-6 bg-gray-950 min-h-screen">
      {/* User Message */}
      <GrokResponse
        content="give me simple html code"
        isUser={true}
        timestamp={new Date(Date.now() - 30000)}
      />
      
      {/* AI Response with HTML Preview */}
      <GrokResponse
        content={htmlContent}
        timestamp={new Date()}
        model="AJ Studioz AI"
        onFeedback={(type) => console.log('Feedback:', type)}
        onCopy={() => console.log('Content copied!')}
      />
      
      {/* Streaming Response */}
      <GrokResponse
        content="I'm generating more examples for you... 🤔"
        isStreaming={true}
        showActions={false}
        model="AJ Studioz AI"
      />
    </div>
  )
}

// UserMessage is already exported above
