# Architecture

This document describes the project architecture and module organization.

## Directory Structure

```
├── domain/           # Business logic layer (framework-agnostic)
│   ├── example/      # Example domain module
│   │   ├── hitokoto/ # Hitokoto API integration
│   │   │   ├── controller.ts  # Business logic orchestration
│   │   │   ├── service.ts     # API service layer
│   │   │   └── type.d.ts      # Type definitions
│   │   ├── forms/    # Form schemas and types
│   │   └── request/  # Request example module
│   └── shared/       # Shared domain utilities
│
├── src/              # Application layer (Next.js specific)
│   ├── app/          # Next.js App Router pages (pages & routes only)
│   │   ├── demo/     # Demo pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/   # React components
│   │   ├── ui/       # Base UI components (shadcn)
│   │   ├── domain/   # Domain-specific UI components
│   │   │   ├── hitokoto/  # Hitokoto UI components
│   │   │   └── request/   # Request UI components
│   │   ├── demo/     # Demo-specific components
│   │   └── home/     # Home page components
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

The domain layer contains **pure business logic** that is **framework-agnostic**:

- **Purpose**: Business logic orchestration, API services, data schemas, type definitions
- **Dependencies**: Only `src/lib/*` abstractions (HttpService, etc.) and external libraries (zod, etc.)
- **Restrictions**: NO React, NO Next.js, NO UI components
- **Exports**: Controllers, Services, Schemas, Types

**Key Principle**: Domain layer must remain framework-agnostic to ensure portability and testability.

```typescript
// domain/example/forms/contact/schema.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

// domain/example/hitokoto/controller.ts
import type { HttpService } from '@/lib/request'

export class Controller {
  static async getData(client: HttpService) {
    const result = await service.getData(client)
    return result
  }
}
```

### Application Layer (`src/`)

The application layer contains Next.js-specific code organized by responsibility:

#### Pages (`src/app/`)
- **Purpose**: Next.js App Router pages and routes
- **Contains**: ONLY page.tsx, layout.tsx, and route-related files
- **Restrictions**: NO reusable components (move to `src/components/`)

#### Components (`src/components/`)
- **`ui/`**: Base UI components (shadcn) - globally reusable
- **`domain/`**: Domain-specific UI components that combine domain logic with UI
- **`demo/`**: Demo-specific components
- **`home/`**: Home page-specific components
- **Root level**: Global components (providers, etc.)

#### Other Directories
- **`hooks/`**: Custom React hooks
- **`lib/`**: Utilities and services (HTTP client, utils, etc.)
- **`store/`**: Zustand state management
- **`config/`**: Application configuration

```typescript
// src/app/demo/page.tsx - Page file
import { Controller } from '@domain/example/request/controller'
import { ScenarioCard } from '@/components/domain/request/scenario-card'

// src/components/domain/request/scenario-card.tsx - Domain UI component
import { Badge } from '@/components/ui/badge'
import { Controller } from '@domain/example/request/controller'

export function ScenarioCard() {
  // Combines domain logic with UI presentation
}
```

## Dependency Rules

```
┌─────────────────────────────────────────────────────────────┐
│                    src/ (Application)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              src/app/ (Pages & Routes)               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  page.tsx  │  │ layout.tsx │  │  route.ts  │    │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │  │
│  └────────┼───────────────┼───────────────┼───────────┘  │
│           │               │               │              │
│           ▼               ▼               ▼              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           src/components/ (UI Components)            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │   ui/    │  │  domain/ │  │   demo/  │          │  │
│  │  │(shadcn)  │  │(Domain UI)│  │(Demo UI) │          │  │
│  │  └────┬─────┘  └─────┬────┘  └─────┬────┘          │  │
│  └───────┼──────────────┼──────────────┼───────────────┘  │
│          │              │              │                  │
│          │              ▼              │                  │
│          │     ┌────────────────┐     │                  │
│          │     │   src/lib/     │     │                  │
│          │     │  (Utilities)   │     │                  │
│          │     └────────┬───────┘     │                  │
│          │              │             │                  │
└──────────┼──────────────┼─────────────┼──────────────────┘
           │              │             │
           │              ▼             │
           │     ┌────────────────┐    │
           │     │   domain/      │    │
           │     │ (Business Logic)│   │
           │     └────────────────┘    │
           │                           │
           └───────────────────────────┘
```

**Architecture Layers**:

1. **Base UI Layer** (`src/components/ui/`)
   - shadcn components: Button, Card, Badge, etc.
   - Globally reusable, no business logic
   - Can be used anywhere in the application

2. **Domain UI Layer** (`src/components/domain/`)
   - Domain-specific UI components
   - Combines domain logic with UI presentation
   - Depends on: `domain/*` (business logic) + `src/components/ui/*` (base UI)

3. **Business Logic Layer** (`domain/`)
   - Pure business logic, framework-agnostic
   - Controllers, Services, Types
   - Depends on: `src/lib/*` abstractions only

**Dependency Flow**:
```
Pages → Domain UI Components → Domain Logic
  ↓           ↓
Base UI ←─────┘
```

**Rules**:

1. `domain/` MUST NOT import from `src/` (except `src/lib/*` abstractions)
2. `domain/` MUST NOT contain React components or UI code
3. `src/app/` MUST ONLY contain page.tsx, layout.tsx, and route files
4. `src/components/domain/` CAN import from `domain/*` and `src/components/ui/*`
5. `src/components/ui/` SHOULD be framework-agnostic (shadcn components)
6. All reusable components MUST be in `src/components/`, not `src/app/`

## Module Organization

### Domain Modules

Each domain module follows this structure:

```
domain/{module}/
├── index.ts          # Barrel export (Controllers, Services, Types)
├── controller.ts     # Business logic orchestration
├── service.ts        # API service layer
├── type.d.ts         # TypeScript types
└── schema.ts         # Zod schemas (optional)
```

**Example**:
```typescript
// domain/example/hitokoto/index.ts
export { Controller } from './controller'
export { service } from './service'
export type * from './type.d'
```

### UI Components

#### Base UI Components (`src/components/ui/`)

shadcn components follow this structure:

```
src/components/ui/{component}/
├── index.tsx         # Component implementation
├── props.ts          # Props interface (optional)
└── {component}.test.tsx  # Tests
```

#### Domain UI Components (`src/components/domain/`)

Domain-specific UI components:

```
src/components/domain/{module}/
└── {component}.tsx   # Component that combines domain logic with UI
```

**Example**:
```typescript
// src/components/domain/hitokoto/hitokoto-card.tsx
import { Controller } from '@domain/example/hitokoto/controller'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function HitokotoCard() {
  // Combines domain logic (Controller) with UI (Button, Card)
}
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
