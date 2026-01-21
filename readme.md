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
├── domain/                    # Business logic layer
│   └── example/               # Example domain modules
│       ├── hitokoto/          # Hitokoto API example
│       │   ├── const/         # Constants and API definitions
│       │   ├── components/    # Domain-specific components
│       │   ├── controller.ts  # Business logic orchestration
│       │   ├── service.ts     # API service layer
│       │   └── type.d.ts      # Type definitions
│       └── request/           # Request example module
│
├── src/                       # Application layer
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── example/           # Example pages
│   │   └── menu/              # Menu example with sidebar
│   ├── components/            # Shared UI components
│   │   └── ui/                # Base UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core utilities
│   │   └── request/           # HTTP client abstraction
│   ├── service/               # HTTP service instances
│   ├── store/                 # Zustand stores
│   └── styles/                # Global styles
│
├── public/                    # Static assets
└── typings/                   # Global type definitions
```

### Architecture Overview

- **`domain/`**: Contains business logic, organized by feature. Each module includes its own types, services, controllers, and components.
- **`src/`**: Contains application-level code including pages, shared components, hooks, and utilities.

This separation ensures:

- Clear boundaries between business logic and UI
- Reusable domain modules
- Easier testing and maintenance

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

The template includes several example implementations:

- **Color Palette** (`/example/color`) - Tailwind CSS color showcase
- **Request Patterns** (`/example/request/*`) - HTTP request examples with error handling
- **Zustand Store** (`/example/zustand`) - State management example
- **Sidebar Menu** (`/menu`) - Navigation with sidebar layout

## Path Aliases

```typescript
import { Controller } from '@domain/example/hitokoto/controller' // domain/*
import { cn } from '@/lib/utils' // src/*
```

## License

MIT
