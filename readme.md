# Next.js Start Template

A modern Next.js starter template with domain-driven architecture, designed for rapid project development.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [/](/) to view your application.

## Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 16 (App Router) |
| UI Library       | React 19                |
| Language         | TypeScript 5.9          |
| Styling          | Tailwind CSS 4          |
| State Management | Zustand                 |
| Data Fetching    | TanStack Query          |
| HTTP Client      | ky                      |
| UI Components    | Radix UI                |
| Linting          | ESLint (antfu config)   |
| Git Hooks        | Lefthook + Commitlint   |

## Project Structure

```
nextjs-start-template/
├── domain/                    # Business logic layer (framework-agnostic)
│   └── example/               # Example domain modules
│       ├── hitokoto/          # Hitokoto API example
│       │   ├── controller.ts  # Business logic orchestration
│       │   ├── service.ts     # API service layer
│       │   └── type.d.ts      # Type definitions
│       ├── forms/             # Form schemas and types
│       └── request/           # Request example module
│
├── src/                       # Application layer
│   ├── app/                   # Next.js App Router (pages & routes only)
│   │   ├── demo/              # Demo pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components (shadcn)
│   │   ├── domain/            # Domain-specific UI components
│   │   │   ├── hitokoto/      # Hitokoto UI components
│   │   │   └── request/       # Request UI components
│   │   ├── demo/              # Demo-specific components
│   │   ├── home/              # Home page components
│   │   └── providers.tsx      # Global providers
│   ├── config/                # Application configuration
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core utilities
│   │   └── request/           # HTTP client abstraction
│   ├── store/                 # Zustand stores
│   └── styles/                # Global styles
│
├── public/                    # Static assets
└── typings/                   # Global type definitions
```

### Architecture Overview

This template follows a **three-layer architecture**:

1. **Domain Layer** (`domain/`)
   - Pure business logic (Controllers, Services, Types)
   - Framework-agnostic, no React/Next.js dependencies
   - Can only depend on `src/lib/*` abstractions

2. **Component Layer** (`src/components/`)
   - **`ui/`**: Base UI components (shadcn) - globally reusable
   - **`domain/`**: Domain-specific UI components that combine domain logic with UI
   - **`demo/`**, **`home/`**: Feature-specific components

3. **Page Layer** (`src/app/`)
   - Next.js App Router pages and routes
   - Only contains page.tsx, layout.tsx, and route files
   - No reusable components (move to `src/components/`)

**Key Benefits**:

- ✅ Clear separation of concerns (business logic vs UI vs routing)
- ✅ Domain layer is portable and testable
- ✅ UI components are reusable and well-organized
- ✅ Follows Next.js App Router best practices

## Available Scripts

| Script          | Description                |
| --------------- | -------------------------- |
| `pnpm dev`      | Start development server   |
| `pnpm build`    | Build for production       |
| `pnpm start`    | Start production server    |
| `pnpm lint`     | Run ESLint                 |
| `pnpm lint:fix` | Fix ESLint errors          |
| `pnpm up`       | Update dependencies (taze) |

## Examples

The template includes several example implementations in `/demo`:

- **Color Palette** (`/demo/ui/color-palette`) - Tailwind CSS color showcase
- **Form Validation** (`/demo/forms/form-validation`) - react-hook-form + zod validation
- **Request Patterns** (`/demo/request/*`) - HTTP request examples with error handling
  - Hitokoto API integration
  - HTTP error scenarios (400, 401, 404, 500, 503)
  - Request interceptors
  - Raw/Envelope response patterns
- **Zustand Store** (`/demo/state/zustand-mouse`) - State management example

Visit [http://localhost:3000/demo](http://localhost:3000/demo) to explore all examples.

## Path Aliases

```typescript
// Domain layer (business logic)
import { Controller } from '@domain/example/hitokoto/controller'
import { contactFormSchema } from '@domain/example/forms/contact'

// Application layer (UI components, utilities)
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { HitokotoCard } from '@/components/domain/hitokoto/hitokoto-card'
```

**Alias Configuration**:
- `@domain/*` → `domain/*` (business logic)
- `@/*` → `src/*` (application layer)

## License

MIT
