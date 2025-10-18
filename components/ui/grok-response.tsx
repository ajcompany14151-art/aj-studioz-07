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
}

// Simple Code Block Component
function CodeBlock({ language = 'text', children, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

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

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-gray-700/50 bg-gray-900/80">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-600/30">
        <div className="flex items-center gap-2">
          {fileName && (
            <div className="flex items-center gap-2 text-gray-300">
              <Code className="w-3 h-3" />
              <span className="text-xs font-medium">{fileName}</span>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(language)}`} />
              <span className="text-xs text-gray-400 font-mono uppercase">
                {language}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-white"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm text-gray-200 font-mono leading-relaxed">
          <code>{children}</code>
        </pre>
      </div>
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
  const sampleContent = `# Welcome to AJ Studioz AI! ✨

I'm your advanced AI assistant, optimized for mobile and desktop. Here's what I can help you with:

## 🚀 Features

Here's some JavaScript code:

\`\`\`javascript
const greeting = "Hello, World!"
console.log(greeting)

// Modern arrow function
const multiply = (a, b) => a * b
console.log(multiply(5, 3))
\`\`\`

## 📋 What I can do:

- Help with coding and development
- Explain complex concepts simply
- Generate creative content
- Provide detailed analysis
- Answer technical questions

> [!INFO] I'm designed to work perfectly on both mobile and desktop devices!

How can I assist you today?`

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-3 sm:p-6">
      <GrokResponse
        content={sampleContent}
        timestamp={new Date()}
        model="AJ Studioz AI"
        onFeedback={(type) => console.log('Feedback:', type)}
        onCopy={() => console.log('Content copied!')}
      />
      
      <GrokResponse
        content="I'm processing your request... 🤔"
        isStreaming={true}
        showActions={false}
        model="AJ Studioz AI"
      />
    </div>
  )
}
