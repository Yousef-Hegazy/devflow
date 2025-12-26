# DevFlow - Copilot Instructions

## Architecture Overview

DevFlow is a Stack Overflow-style Q&A platform built with **Next.js 16 (App Router)**, **Appwrite** (backend/database), and **Hono** (API routes). Key architectural decisions:

- **Backend**: Appwrite TablesDB for data storage with admin/session clients in [lib/appwrite/config.ts](../lib/appwrite/config.ts)
- **API Routes**: Hono framework mounted at `/api/[[...route]]` - see [route.ts](../app/api/[[...route]]/route.ts) for pattern
- **State Management**: Zustand for client auth state ([stores/authStore.ts](../stores/authStore.ts)), TanStack Query for server data
- **UI Components**: Base UI components from `@base-ui-components/react` (NOT shadcn/ui despite components.json presence)

## Data Flow Pattern

```
Server Actions (actions/) ──> Appwrite TablesDB
       ↑
TanStack Query hooks (lib/queries/) ──> Components
       ↑
Zustand stores (stores/) ──> Client-side auth state
```

### Server Actions
- Located in `actions/` - use `"use server"` directive
- Handle authentication via `getCurrentUser()` from [lib/server/auth.ts](../lib/server/auth.ts)
- Use `handleError()` from [lib/errors.ts](../lib/errors.ts) for consistent error handling with 401 redirects
- Transactions use `database.createTransaction()` and `database.createOperations()` for atomic operations

### Query Hooks
- Located in `lib/queries/` - wrap server actions with TanStack Query mutations
- Use `toastManager.add()` from [components/ui/toast.tsx](../components/ui/toast.tsx) for success/error notifications
- Cache keys defined in [lib/constants/cacheKeys.ts](../lib/constants/cacheKeys.ts) as `CACHE_KEYS` enum

## Key Conventions

### Caching (Next.js 15+ Pattern)
```typescript
"use cache";
cacheLife({ revalidate: DEFAULT_CACHE_DURATION });  // 300 seconds
cacheTag(CACHE_KEYS.QUESTIONS_LIST, ...);
```
Invalidate with `updateTag(CACHE_KEYS.QUESTIONS_LIST)` from `next/cache`.

### Validation
- Schemas in `lib/validators/` using Zod v4
- Types inferred with `z.infer<typeof Schema>` and exported as `SchemaType`
- Hono routes validate with `zValidator("json", Schema)`

### Appwrite Types
- Auto-generated types in [lib/appwrite/types.ts](../lib/appwrite/types.ts) - extend `Models.Row`
- Use `Query` builder from `node-appwrite` for database queries
- Permissions set with `Permission.read(Role.any())`, `Permission.write(Role.user(userId))`

### Client Components
- Forms use `react-hook-form` with `zodResolver` - see [QuestionForm.tsx](../components/forms/QuestionForm.tsx)
- Auth state hydrated via [AuthHydrator.tsx](../components/AuthHydrator.tsx) in root layout
- Use `useAuthStore()` for accessing current user on client

### Logging
- Use `logger` from [pino.ts](../pino.ts) - auto-redacts sensitive fields
- Pretty-printing in dev, JSON in production

## File Structure Patterns

| Directory | Purpose |
|-----------|---------|
| `actions/` | Server actions (mutations) |
| `lib/queries/` | TanStack Query hooks calling server actions |
| `lib/validators/` | Zod schemas + inferred types |
| `lib/server/` | Server-only utilities (`import "server-only"`) |
| `lib/constants/` | App constants, cache keys, UI config |
| `components/ui/` | Base UI primitives (Base UI, not shadcn) |
| `components/forms/` | Form components with react-hook-form |

## Common Tasks

### Adding a New Feature
1. Define Zod schema in `lib/validators/`
2. Create server action in `actions/` with `"use server"`
3. Add TanStack Query hook in `lib/queries/` for client consumption
4. Add cache key to `CACHE_KEYS` enum if caching needed

### Creating Appwrite Clients
```typescript
// Admin operations (no session required)
const { database } = await createAdminClient();

// User operations (requires session)
const { database, account } = await createSessionClient();
```

### Error Handling in Actions
```typescript
try {
  // ... operation
} catch (error) {
  throw handleError(error);  // Redirects on 401, returns Error otherwise
}
```

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint
