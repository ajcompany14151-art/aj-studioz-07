# Overview

AJ Studioz AI is a Next.js-based AI chatbot application featuring advanced conversational capabilities with multiple AI models, artifact creation (code, text, images, spreadsheets), and comprehensive document management. The application supports real-time chat interactions, file uploads, document collaboration, and multimodal input including images and attachments.

The system is designed as a premium AI assistant similar to Claude/ChatGPT, with specialized features like chain-of-thought reasoning, visual diagram generation (Mermaid.js), OCR for document analysis, and export capabilities (PDF/Word). It includes three distinct AI models: Lynxa Lite (fast responses), Lynxa Pro (versatile conversations), and Lynxa Student Pro (advanced reasoning with educational features).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

- **Framework**: Next.js 15 with App Router and Partial Prerendering (PPR)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS 4.x with custom design tokens supporting dark/light themes
- **State Management**: React hooks with SWR for data fetching and caching
- **Real-time Updates**: AI SDK streaming with custom data stream handlers
- **Responsive Design**: Mobile-first approach with progressive enhancement

## Backend Architecture

- **API Routes**: Next.js API routes for chat, file uploads, authentication, and document management
- **AI Integration**: Vercel AI SDK with multiple providers (Groq, OpenAI, xAI)
- **Model Configuration**: 
  - Lynxa Lite: llama-3.1-8b-instant (fast responses)
  - Lynxa Pro: llama-3.3-70b-versatile (general conversations)
  - Lynxa Student Pro: deepseek-r1-distill-llama-70b (reasoning with artifacts)
- **API Key Rotation**: Automatic failover between multiple Groq API keys to handle rate limits
- **Streaming**: Server-sent events for real-time AI responses with data annotations

## Authentication System

- **Provider**: NextAuth.js v5 (Auth.js)
- **Strategies**: 
  - Email/password authentication with credential provider
  - Google OAuth integration for social login
  - Guest mode with auto-generated credentials
- **Session Management**: JWT-based sessions with secure cookies
- **Middleware**: Route protection and automatic guest creation for unauthenticated users

## Data Storage

- **Database**: PostgreSQL with Drizzle ORM
- **Schema Design**:
  - Users table with email, password hash, and user types
  - Chats table with visibility settings (public/private)
  - Messages table with JSON parts structure for multimodal content
  - Documents table for artifacts with versioning support
  - Votes table for message feedback
  - Suggestions table for document collaboration
- **File Storage**: Vercel Blob for attachments and uploaded files
- **Caching**: Optional Redis integration for rate limiting and session caching

## Artifact System

The application features a comprehensive artifact creation system inspired by Claude:

- **Artifact Types**:
  - Code: Interactive code editor with syntax highlighting (CodeMirror)
  - Text: Rich text documents with Markdown support (ProseMirror)
  - Images: AI-generated images with base64 encoding
  - Sheets: Spreadsheet functionality with CSV import/export (react-data-grid)
- **Versioning**: Complete version history with diff viewing
- **Export**: PDF and Word document export with AJ STUDIOZ branding
- **Collaboration**: Suggestion system for document improvements

## Document Processing

- **OCR**: Tesseract.js for extracting text from images and handwritten notes
- **PDF Processing**: pdf.js for text extraction with table support
- **Word Documents**: Mammoth for parsing .doc and .docx files
- **Confidence Scoring**: OCR results include confidence metrics

## Visual Diagrams

- **Mermaid.js Integration**: Dynamic rendering of flowcharts, mind maps, sequence diagrams, and class diagrams
- **Use Cases**: Step-by-step problem breakdowns, process flows, concept maps, timelines

## Rate Limiting & Performance

- **API Key Pool**: Support for up to 5 Groq API keys with round-robin selection
- **Smart Failover**: Automatic retry with different keys when rate limits hit
- **Token Management**: 500K tokens/day capacity with 5 keys (100K per key)
- **Request Limits**: 72K requests/day total capacity

# External Dependencies

## AI Services

- **Groq**: Primary AI provider for LLaMA models (llama-3.1-8b, llama-3.3-70b, deepseek-r1-distill-llama-70b)
- **OpenAI** (optional): Alternative provider for GPT models
- **xAI** (optional): Support for Grok models
- **AI Gateway**: Vercel AI SDK Gateway for provider abstraction

## Database & Storage

- **PostgreSQL**: Primary database (recommended: Vercel Postgres or Neon)
- **Vercel Blob**: File storage for attachments and uploads
- **Redis** (optional): Caching and rate limiting

## Authentication

- **Google OAuth**: Social login integration via Google Cloud Console
- **NextAuth.js**: Complete authentication framework

## Third-Party Libraries

- **Mermaid.js**: Diagram and flowchart rendering
- **Tesseract.js**: OCR for text extraction from images
- **pdf.js**: PDF document parsing
- **Mammoth**: Word document conversion
- **ProseMirror**: Rich text editing engine
- **CodeMirror**: Code editor with syntax highlighting
- **react-data-grid**: Spreadsheet component
- **PapaParse**: CSV parsing and generation
- **jsPDF**: PDF generation for exports
- **Framer Motion**: Animation library for UI transitions

## Development Tools

- **TypeScript**: Type-safe development
- **Biome**: Linting and code formatting
- **Playwright**: End-to-end testing
- **Drizzle Kit**: Database migrations and schema management
- **SWR**: Data fetching and caching
- **TailwindCSS**: Utility-first CSS framework
- **Next.js**: React framework with server-side rendering

## Deployment Platform

- **Vercel**: Primary deployment platform with automatic builds from GitHub
- **Environment Variables**: Managed through Vercel dashboard for production, preview, and development environments