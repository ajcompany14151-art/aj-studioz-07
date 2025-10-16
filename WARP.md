# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
pnpm dev                # Start development server with Turbo
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run Ultracite linter check
pnpm format             # Format code with Ultracite
```

### Database Management
```bash
pnpm db:generate        # Generate Drizzle schema from TypeScript
pnpm db:migrate         # Run database migrations
pnpm db:studio          # Open Drizzle Studio (database GUI)
pnpm db:push            # Push schema changes to database
pnpm db:pull            # Pull schema from database
pnpm db:check           # Check migration consistency
pnpm db:up              # Apply outstanding migrations
```

### Testing
```bash
pnpm test               # Run Playwright e2e tests
```

### Single Test Execution
To run specific tests, use Playwright's built-in filtering:
```bash
npx playwright test --grep "test-name"
npx playwright test path/to/test.spec.ts
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router with PPR)
- **AI Integration**: Vercel AI SDK with multiple providers (Groq, OpenAI, xAI)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Storage**: Vercel Blob for file uploads
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **Code Quality**: Biome with Ultracite configuration

### Core Components Architecture

#### AI Chat System (`app/(chat)/`)
- **Main Chat Interface** (`components/chat.tsx`): Core chat component handling message flow
- **AI Models** (`lib/ai/models.ts`): Model configuration, currently supports "Lynxa Lite" via Gemini
- **Providers** (`lib/ai/providers.ts`): AI provider abstractions for different services
- **Streaming** (`components/data-stream-handler.tsx`): Real-time message streaming

#### Artifacts System
Advanced document/code editing system similar to Claude Artifacts:
- **Code Editor** (`components/code-editor.tsx`): CodeMirror-based editor with syntax highlighting
- **Document Preview** (`components/document-preview.tsx`): Rich document rendering
- **Artifact Management** (`components/artifact.tsx`): Main artifact container
- **Server Functions** (`lib/artifacts/server.ts`): Backend artifact operations

#### Authentication Flow (`app/(auth)/`)
- **Guest Mode**: Automatic guest login via `/api/auth/guest`
- **User Registration**: Email/password and Google OAuth
- **Session Management**: NextAuth.js with database sessions

#### Database Schema (`lib/db/schema.ts`)
- **Users**: Basic user management with email/password
- **Chats**: Conversation threads with visibility controls
- **Messages**: Versioned message system (v1 deprecated, v2 current)
- **Documents**: Artifact document storage
- **Suggestions**: Document editing suggestions
- **Votes**: Message rating system

### Key Configuration Files

#### Package Management
- Uses **pnpm** as package manager
- **Biome** for linting/formatting with Ultracite config preset
- Excludes `components/ui`, `lib/utils.ts`, `hooks/use-mobile.ts` from linting

#### Database Configuration (`drizzle.config.ts`)
- PostgreSQL dialect
- Schema in `./lib/db/schema.ts`
- Migrations in `./lib/db/migrations`
- Requires `POSTGRES_URL` environment variable

#### Next.js Configuration (`next.config.ts`)
- Experimental PPR (Partial Prerendering) enabled
- Remote image patterns configured for avatars
- Turbo mode available for development

### Environment Setup Requirements
```
GROQ_API_KEY=           # Primary AI provider
AUTH_SECRET=            # Authentication secret (generate with openssl rand -base64 32)
POSTGRES_URL=           # PostgreSQL connection string
BLOB_READ_WRITE_TOKEN=  # Vercel Blob storage token
GOOGLE_CLIENT_ID=       # Google OAuth (optional)
GOOGLE_CLIENT_SECRET=   # Google OAuth (optional)
REDIS_URL=              # Redis for caching (optional)
```

### File Organization
- `app/`: Next.js App Router pages and layouts
- `components/`: React components (UI, chat, artifacts)
- `lib/`: Utilities, database, AI configuration, and business logic
- `hooks/`: Custom React hooks
- `public/`: Static assets including logo.jpg
- `artifacts/`: Generated content storage

### Development Notes
- The app supports both guest and authenticated user modes
- AI responses stream in real-time using React Server Components
- Artifacts system allows creating and editing code, documents, spreadsheets, and images
- Database uses composite foreign keys for document versioning
- Custom logo branding throughout the application