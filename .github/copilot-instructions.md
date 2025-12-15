# DevFlow AI Coding Instructions

## Architecture Overview

DevFlow is a Next.js 16 application using the app router, built with React 19. It follows a community-driven Q&A platform pattern similar to Stack Overflow.

### Core Technologies
- **Frontend**: Next.js 16 (app router), React 19, TypeScript
- **Backend**: Appwrite (database, auth, storage, file handling)
- **State Management**: Zustand (auth), TanStack Query (server state)
- **Styling**: Tailwind CSS with shadcn/ui components (New York style)
- **Forms**: React Hook Form with Zod validation
- **Caching**: Next.js built-in caching with "use cache" directive
- **Markdown**: MDXEditor for rich text editing

### Key Architectural Decisions
- Server actions handle all mutations (located in `actions/` folder)
- Data fetching uses Appwrite SDK with admin/session clients
- Complex operations use Appwrite transactions (e.g., question creation with tags)
- Authentication state hydrated via Zustand store from server-side user fetch
- Queries cached with Next.js cache tags for invalidation

### Data Flow Patterns
- **Reads**: Server components fetch data directly from Appwrite using admin client, cached with Next.js
- **Writes**: Client components trigger server actions via TanStack Query mutations
- **Auth**: Server fetches user on layout, hydrates Zustand store on client
- **Relations**: Appwrite queries with select/include patterns (e.g., `author.name`, `tags.tag.title`)

## Developer Workflows

### Essential Commands
- `npm run dev` - Start development server with Turbopack optimizations
- `npm run build` - Production build with React Compiler enabled
- `npm run lint` - ESLint checking (Next.js config)

### Build Configuration
- React Compiler enabled for optimization
- Turbopack filesystem cache for faster dev rebuilds
- Component caching enabled
- Remote images allowed from localhost for development

## Project-Specific Conventions

### Form Handling
Always use controlled components with React Hook Form:
```tsx
const { control, handleSubmit } = useForm<Schema>({
  resolver: zodResolver(Schema),
  mode: "all"
});
```
Use `ControlledField` component for inputs with built-in validation display.

### Server Actions Pattern
Place in `actions/` folder, use "use server" directive:
```typescript
export async function createQuestion(userId: string, data: SchemaType) {
  const { database } = await createAdminClient();
  // Implementation
}
```

### Query Patterns
Mutations in `lib/queries/` with toast notifications and router navigation:
```typescript
export function useCreateQuestion() {
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (id) => {
      toastManager.add({ title: "Success", type: "success" });
      router.push(`/questions/${id}`);
    }
  });
}
```

### Component Organization
- `components/ui/` - shadcn/ui primitives
- `components/forms/` - Form components with ControlledField
- `components/cards/` - Data display cards
- `components/navigation/` - Layout components
- Custom hooks in `hooks/`

### Appwrite Integration
- Use `createAdminClient()` for server-side operations
- Use `createSessionClient()` for user-scoped operations
- Tables defined in `lib/constants/server.ts`
- Types in `lib/appwrite/types/appwrite.ts`

### Caching Strategy
Use Next.js cache with tags for invalidation:
```typescript
"use cache";
cacheTag(CACHE_KEYS.QUESTIONS_LIST, ...params);
```

### Authentication Flow
- Server fetches user in layout, passes to `AuthHydrator`
- Zustand store updated on client hydration
- Protected routes check `useAuthStore`

### Error Handling
- Appwrite errors use a small helper: `handleError` in `lib/errors.ts`.
- `handleError(err)` returns either `{ redirectTo: '/sign-in' }` for 401 Appwrite errors, or `{ error: Error }` for other cases.
- Callers should perform the redirect using their platform (e.g., `c.redirect('/sign-in')` in Hono or `redirect('/sign-in')` in Next server code).
- Example (Hono API): the `/app/api` handler uses `handleError` to decide between `c.redirect()` and returning a JSON error.

## Key Files to Reference

- [app/layout.tsx](app/layout.tsx) - Provider setup and auth hydration
- [actions/questions.ts](actions/questions.ts) - Complex transaction example
- [lib/queries/questions.ts](lib/queries/questions.ts) - Mutation patterns
- [components/forms/QuestionForm.tsx](components/forms/QuestionForm.tsx) - Form implementation
- [lib/appwrite/config.ts](lib/appwrite/config.ts) - Client setup
- [stores/authStore.ts](stores/authStore.ts) - Auth state management</content>
<parameter name="filePath">d:\personal_projects\Next\devflow\.github\copilot-instructions.md