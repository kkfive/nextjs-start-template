# Architecture

This document describes the project architecture and module organization.

## Directory Structure

```
├── domain/           # Business logic layer (framework-agnostic)
│   ├── example/      # Example domain module
│   │   ├── hitokoto/ # Hitokoto API integration
│   │   └── forms/    # Form schemas and types
│   └── shared/       # Shared domain utilities
│
├── src/              # Application layer (Next.js specific)
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   │   └── ui/       # Reusable UI components
│   ├── config/       # Application configuration
│   ├── hooks/        # React hooks
│   ├── lib/          # Utilities and services
│   │   └── request/  # HTTP client (ky wrapper)
│   ├── store/        # Zustand stores
│   └── __tests__/    # Test utilities and mocks
│
└── docs/             # Documentation
```

## Layer Separation

### Domain Layer (`domain/`)

The domain layer contains business logic that is **framework-agnostic**:

- **Purpose**: Pure business logic, data schemas, type definitions
- **Dependencies**: Only external libraries (zod, etc.), no React/Next.js
- **Exports**: Schemas, types, service functions

```typescript
// domain/example/forms/contact/schema.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})
```

### Application Layer (`src/`)

The application layer contains Next.js-specific code:

- **Purpose**: UI components, pages, hooks, state management
- **Dependencies**: Can import from `domain/`, React, Next.js
- **Exports**: Components, hooks, utilities

```typescript
// src/app/example/form/page.tsx
import { contactFormSchema } from '@domain/example/forms/contact'
```

## Dependency Rules

```
┌─────────────────────────────────────────────────────┐
│                    src/ (Application)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │    app/     │  │ components/ │  │   hooks/    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │        │
│         └────────────────┼────────────────┘        │
│                          │                         │
│                          ▼                         │
│                    ┌───────────┐                   │
│                    │   lib/    │                   │
│                    └─────┬─────┘                   │
└──────────────────────────┼─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  domain/ (Business)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   example/  │  │   shared/   │  │    ...      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Rules**:

1. `domain/` MUST NOT import from `src/`
2. `src/` CAN import from `domain/`
3. `domain/shared/` can be imported by any domain module
4. `src/lib/` provides utilities for `src/` components

## Module Organization

### Domain Modules

Each domain module follows this structure:

```
domain/{module}/
├── index.ts          # Barrel export
├── schema.ts         # Zod schemas
├── type.d.ts         # TypeScript types
└── service.ts        # Service functions (optional)
```

### UI Components

UI components follow this structure:

```
src/components/ui/{component}/
├── index.tsx         # Component implementation
├── props.ts          # Props interface
└── {component}.test.tsx  # Tests
```

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@domain/*": ["./domain/*"]
  }
}
```

## Testing Strategy

- **Unit tests**: Pure functions, schemas, utilities
- **Component tests**: React components with Testing Library
- **Integration tests**: API routes, data fetching
- **Mocking**: MSW for HTTP requests

See `src/__tests__/` for test utilities and mock setup.
