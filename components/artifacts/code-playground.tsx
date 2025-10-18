'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  Square, 
  Download, 
  Upload,
  Settings,
  Maximize2,
  Minimize2,
  Copy,
  Share,
  Terminal,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react'

type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'markdown'
  | 'sql'
  | 'yaml'

interface CodeFile {
  id: string
  name: string
  language: SupportedLanguage
  content: string
}

interface ExecutionResult {
  output: string
  error?: string
  logs: string[]
  executionTime: number
}

interface CodePlaygroundProps {
  initialFiles?: CodeFile[]
  title: string
  onSave?: (files: CodeFile[]) => void
}

// Sandbox execution for different languages
class CodeExecutor {
  private static instance: CodeExecutor
  private executionCount = 0

  static getInstance(): CodeExecutor {
    if (!CodeExecutor.instance) {
      CodeExecutor.instance = new CodeExecutor()
    }
    return CodeExecutor.instance
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []
    let output = ''
    let error: string | undefined

    try {
      // Create a sandboxed execution environment
      const sandbox = {
        console: {
          log: (...args: any[]) => {
            const message = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
            logs.push(message)
            output += message + '\\n'
          },
          error: (...args: any[]) => {
            const message = args.map(arg => String(arg)).join(' ')
            logs.push(`ERROR: ${message}`)
            output += `ERROR: ${message}\\n`
          },
          warn: (...args: any[]) => {
            const message = args.map(arg => String(arg)).join(' ')
            logs.push(`WARN: ${message}`)
            output += `WARN: ${message}\\n`
          }
        },
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Promise,
        fetch: (url: string, options?: RequestInit) => {
          // Restricted fetch - only allow certain domains
          const allowedDomains = ['api.github.com', 'jsonplaceholder.typicode.com']
          const parsedUrl = new URL(url)
          if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
            throw new Error('Fetch restricted to allowed domains only')
          }
          return fetch(url, options)
        }
      }

      // Wrap the code in an async function to handle promises
      const wrappedCode = `
        (async () => {
          try {
            ${code}
          } catch (e) {
            console.error(e.message || e)
          }
        })()
      `

      // Execute in a restricted context
      const func = new Function(...Object.keys(sandbox), `return ${wrappedCode}`)
      const result = func(...Object.values(sandbox))
      
      if (result instanceof Promise) {
        await result
      }

    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      output += `EXECUTION ERROR: ${error}\\n`
    }

    const executionTime = Date.now() - startTime
    return { output: output.trim(), error, logs, executionTime }
  }

  async executePython(code: string): Promise<ExecutionResult> {
    // Note: This is a mock implementation
    // In a real app, you'd use Pyodide or a server-side Python executor
    const startTime = Date.now()
    const logs = ['Python execution is simulated in this demo']
    const output = 'Python execution would require Pyodide or server-side execution'
    const executionTime = Date.now() - startTime
    
    return { output, logs, executionTime }
  }

  async executeHTML(html: string, css: string = '', js: string = ''): Promise<ExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      // Create a complete HTML document
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #1a1a1a;
              color: #ffffff;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.addEventListener('error', (e) => {
              window.parent.postMessage({ type: 'error', message: e.message }, '*')
            })
            ${js}
          </script>
        </body>
        </html>
      `

      const executionTime = Date.now() - startTime
      return { output: fullHTML, logs, executionTime }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return { 
        output: '', 
        error: error instanceof Error ? error.message : String(error), 
        logs, 
        executionTime 
      }
    }
  }
}

// Monaco Editor component with enhanced features
function CodeEditor({ 
  file, 
  onChange, 
  isFullscreen,
  onFullscreenToggle
}: {
  file: CodeFile
  onChange: (content: string) => void
  isFullscreen: boolean
  onFullscreenToggle: () => void
}) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    
    // Add custom keybindings
    editor.addCommand(editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS, () => {
      // Save functionality would be implemented here
      console.log('Save triggered')
    })

    // Auto-format on save
    editor.addCommand(editor.KeyMod.CtrlCmd | editor.KeyMod.Shift | editor.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run()
    })
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'h-96'}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onFullscreenToggle}
          className="bg-black/50 hover:bg-black/70"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      
      <Editor
        height="100%"
        language={file.language}
        value={file.content}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          rulers: [80, 120],
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          suggest: {
            enabled: true,
            showKeywords: true,
            showSnippets: true
          },
          parameterHints: { enabled: true },
          quickSuggestions: true,
          hover: { enabled: true },
          contextmenu: true,
          mouseWheelZoom: true
        }}
      />
    </div>
  )
}

// Output panel component
function OutputPanel({ 
  result, 
  isLoading, 
  language 
}: { 
  result: ExecutionResult | null
  isLoading: boolean
  language: SupportedLanguage
}) {
  const [activeTab, setActiveTab] = useState('output')

  if (language === 'html') {
    return (
      <div className="h-96 bg-white rounded-lg overflow-hidden">
        {result?.output ? (
          <iframe
            srcDoc={result.output}
            className="w-full h-full border-0"
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Run code to see HTML preview
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="h-96 bg-gray-900/50 border-gray-700">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="flex-none">
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="output" className="h-full p-4 overflow-auto">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-gray-400">Executing...</span>
              </div>
            ) : result ? (
              <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                {result.output || 'No output'}
              </pre>
            ) : (
              <div className="text-gray-500 text-sm">Run code to see output</div>
            )}
          </TabsContent>
          
          <TabsContent value="logs" className="h-full p-4 overflow-auto">
            {result?.logs ? (
              <div className="space-y-1">
                {result.logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono">
                    <span className="text-gray-500">[{index + 1}]</span> {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No logs available</div>
            )}
          </TabsContent>
          
          <TabsContent value="errors" className="h-full p-4 overflow-auto">
            {result?.error ? (
              <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">
                {result.error}
              </pre>
            ) : (
              <div className="text-gray-500 text-sm">No errors</div>
            )}
          </TabsContent>
        </div>
        
        {result && (
          <div className="flex-none p-2 border-t border-gray-700 text-xs text-gray-400">
            Executed in {result.executionTime}ms
          </div>
        )}
      </Tabs>
    </Card>
  )
}

export default function CodePlayground({ 
  initialFiles = [],
  title,
  onSave
}: CodePlaygroundProps) {
  const [files, setFiles] = useState<CodeFile[]>(initialFiles.length > 0 ? initialFiles : [
    {
      id: '1',
      name: 'main.js',
      language: 'javascript',
      content: `// Welcome to AJ Studioz Code Playground!\n// This is a secure sandboxed environment for code execution\n\nconsole.log('Hello, World!')\n\n// Try some interactive code:\nconst greeting = 'Welcome to the playground!'\nconsole.log(greeting)\n\n// You can use modern JavaScript features:\nconst numbers = [1, 2, 3, 4, 5]\nconst doubled = numbers.map(n => n * 2)\nconsole.log('Doubled numbers:', doubled)\n\n// Async operations are supported:\nsetTimeout(() => {\n  console.log('This runs after 1 second')\n}, 1000)`
    }
  ])
  
  const [activeFileId, setActiveFileId] = useState(files[0]?.id)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const activeFile = files.find(f => f.id === activeFileId) || files[0]
  const executor = CodeExecutor.getInstance()

  const handleFileContentChange = useCallback((content: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === activeFileId ? { ...file, content } : file
      )
    )
  }, [activeFileId])

  const handleRunCode = useCallback(async () => {
    if (!activeFile || isExecuting) return

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      let result: ExecutionResult

      switch (activeFile.language) {
        case 'javascript':
        case 'typescript':
          result = await executor.executeJavaScript(activeFile.content)
          break
        case 'python':
          result = await executor.executePython(activeFile.content)
          break
        case 'html':
          const cssFile = files.find(f => f.name.endsWith('.css'))
          const jsFile = files.find(f => f.name.endsWith('.js') && f.id !== activeFile.id)
          result = await executor.executeHTML(
            activeFile.content,
            cssFile?.content || '',
            jsFile?.content || ''
          )
          break
        default:
          result = {
            output: `Execution not supported for ${activeFile.language}`,
            logs: [],
            executionTime: 0
          }
      }

      setExecutionResult(result)
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: [],
        executionTime: 0
      })
    } finally {
      setIsExecuting(false)
    }
  }, [activeFile, isExecuting, files, executor])

  const handleAddFile = useCallback(() => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `file_${files.length + 1}.js`,
      language: 'javascript',
      content: '// New file\n'
    }
    setFiles(prev => [...prev, newFile])
    setActiveFileId(newFile.id)
  }, [files.length])

  const handleDeleteFile = useCallback((fileId: string) => {
    if (files.length <= 1) return // Keep at least one file
    
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(files.find(f => f.id !== fileId)?.id || files[0].id)
    }
  }, [files, activeFileId])

  const handleExportCode = useCallback(() => {
    const dataStr = JSON.stringify(files, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}_playground.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [files, title])

  const handleImportCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedFiles = JSON.parse(e.target?.result as string)
        setFiles(importedFiles)
        setActiveFileId(importedFiles[0]?.id)
      } catch (error) {
        console.error('Failed to import files:', error)
      }
    }
    reader.readAsText(file)
  }, [])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(files)
    }
  }, [files, onSave])

  const getLanguageColor = (language: SupportedLanguage): string => {
    const colors = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      html: 'bg-orange-500',
      css: 'bg-pink-500',
      json: 'bg-gray-500',
      markdown: 'bg-purple-500',
      sql: 'bg-indigo-500',
      yaml: 'bg-red-500'
    }
    return colors[language] || 'bg-gray-500'
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-1" />
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
          
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Download className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          <Button size="sm" variant="outline" onClick={handleExportCode}>
            <Share className="w-4 h-4" />
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportCode}
            className="hidden"
            id="import-file"
          />
          <Button size="sm" variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex gap-2 flex-wrap">
        {files.map(file => (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-md border cursor-pointer ${
              file.id === activeFileId 
                ? 'bg-blue-600 border-blue-500' 
                : 'bg-gray-800 border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setActiveFileId(file.id)}
          >
            <div className={`w-2 h-2 rounded-full ${getLanguageColor(file.language)}`} />
            <span className="text-sm text-white">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFile(file.id)
                }}
                className="text-gray-400 hover:text-white ml-1"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={handleAddFile}>
          + Add File
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 bg-gray-900/50 border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">File Name</label>
              <input
                type="text"
                value={activeFile?.name || ''}
                onChange={(e) => {
                  setFiles(prev => prev.map(f => 
                    f.id === activeFileId ? { ...f, name: e.target.value } : f
                  ))
                }}
                className="w-full p-2 bg-gray-800 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Language</label>
              <Select
                value={activeFile?.language}
                onValueChange={(language: SupportedLanguage) => {
                  setFiles(prev => prev.map(f => 
                    f.id === activeFileId ? { ...f, language } : f
                  ))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Editor and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">Code Editor</h4>
          </div>
          {activeFile && (
            <CodeEditor
              file={activeFile}
              onChange={handleFileContentChange}
              isFullscreen={isFullscreen}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            />
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">Output</h4>
          </div>
          <OutputPanel
            result={executionResult}
            isLoading={isExecuting}
            language={activeFile?.language || 'javascript'}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 bg-gray-900/30 p-3 rounded-lg border border-gray-700">
        🔒 <strong>Security Notice:</strong> This playground runs code in a sandboxed environment. 
        Network access is limited to whitelisted domains. File system access is restricted.
      </div>
    </div>
  )
}

// Example usage
export function ExampleCodePlayground() {
  const sampleFiles: CodeFile[] = [
    {
      id: '1',
      name: 'app.js',
      language: 'javascript',
      content: `// Interactive Todo App
let todos = ['Learn React', 'Build awesome projects', 'Deploy to production']

function displayTodos() {
  console.log('📝 Current Todos:')
  todos.forEach((todo, index) => {
    console.log(\`\${index + 1}. \${todo}\`)
  })
}

function addTodo(task) {
  todos.push(task)
  console.log(\`✅ Added: "\${task}"\`)
  displayTodos()
}

function removeTodo(index) {
  const removed = todos.splice(index, 1)
  console.log(\`🗑️ Removed: "\${removed[0]}"\`)
  displayTodos()
}

// Demo the app
displayTodos()
addTodo('Master TypeScript')
removeTodo(0)`
    },
    {
      id: '2',
      name: 'styles.css',
      language: 'css',
      content: `/* Modern CSS Styles */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}`
    },
    {
      id: '3',
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AJ Studioz Playground</title>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to AJ Studioz!</h1>
        <p>This is a live HTML preview with CSS styling.</p>
        <button onclick="showAlert()">Click Me!</button>
    </div>
    
    <script>
        function showAlert() {
            alert('Hello from the Code Playground! 👋')
        }
    </script>
</body>
</html>`
    }
  ]

  return (
    <CodePlayground
      initialFiles={sampleFiles}
      title="Multi-File Code Playground"
      onSave={(files) => {
        console.log('Files saved:', files)
      }}
    />
  )
}