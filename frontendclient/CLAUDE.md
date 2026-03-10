# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start Vite development server (runs on http://localhost:5173)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Environment Setup
The project requires a `.env` file in the root directory with:
```
VITE_API_URL=http://localhost:8080/api
```
See `.env.example` for reference. This is the backend API URL for all fetch requests.

## Project Architecture

### Tech Stack
- **React 19** with TypeScript for UI
- **Vite** for fast development and building
- **Tailwind CSS 4** with `@tailwindcss/vite` plugin for styling
- **Radix UI** (@radix-ui/* primitives) for accessible component foundations
- **Shadcn/ui** - UI components built on Radix UI with Tailwind CSS
- **React Router DOM 7** for client-side routing
- **Framer Motion** for animations
- **Socket.io-client** for real-time chat functionality

### Directory Structure
```
src/
├── components/
│   ├── ui/              # Shadcn/ui primitive components (button, card, dialog, etc.)
│   └── shared/          # Application-specific components
│       ├── feed/        # Feed-related components (FeedHeader, PostsList, etc.)
│       └── post-details/ # Post detail components (comments, forms, etc.)
├── contexts/            # React Context providers (authentication)
├── hooks/              # Custom React hooks (useDebounce, useTimeAgo)
├── lib/                # Utility functions
├── pages/              # Route/page components
├── services/           # Service layer (auth.service.ts for token management)
├── types/              # TypeScript type definitions
└── App.tsx             # Main routing configuration
```

### Path Aliases
The `@` alias is configured to resolve to `./src`:
- Import example: `import { Button } from '@/components/ui/button'`
- Works in both Vite config and TypeScript config

## Key Architectural Patterns

### Authentication Flow
1. JWT-based authentication with tokens stored in localStorage
2. **Auth Context** (`src/contexts/auth.context.tsx`) provides:
   - `user`: Current user object
   - `token`: JWT token for API requests
   - `login()` / `logout()` methods
   - `updateUserContext()` for updating user data
3. **Auth Service** (`src/services/auth.service.ts`) handles:
   - `saveAuthData()` / `clearAuthData()` for localStorage management
   - `getToken()` / `getUser()` for retrieving stored data
   - `updateLocalUser()` for updating user profile data locally
4. Protected routes check for token presence

### API Integration Pattern
API calls use native `fetch()` with the following pattern:
```typescript
const API_URL = import.meta.env.VITE_API_URL;

const response = await fetch(`${API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'GET/POST/PUT/DELETE',
  body: JSON.stringify(data) // for POST/PUT
});
```

**Key endpoints:**
- `/auth/signin` - User login
- `/feed` - Feed posts with cursor-based pagination (query param: `?cursor=xxx`)
- Chat endpoints use Socket.io for real-time messaging

### State Management
- **React Context API** for global authentication state
- **Component-level state** using `useState` for local UI state
- **Custom hooks** for reusable logic (debouncing, time formatting)
- Server state is managed with loading/error/success patterns

### Component Architecture
- **UI Components** (`components/ui/`): Shadcn/ui primitives - Radix UI components styled with Tailwind CSS. These are low-level, reusable components.
- **Shared Components** (`components/shared/`): Application-specific components that compose UI components
- **Page Components** (`pages/`): Route-level components that orchestrate shared components

### Routing Structure
Routes are defined in `src/App.tsx` using React Router DOM:
- Public routes: `/`, `/login`, `/cadastro`, `/nosso-time`
- Protected routes: `/feed`, `/perfil`, `/configuracoes`, `/trabalhos`, `/projetos`, `/mensagens`
- Dynamic routes: `/perfil/:username`, `/post/:id`, `/projetos/:id`, `/chat/:conversationId`

### Pagination Pattern
The feed uses **cursor-based pagination** for infinite scrolling:
- Initial fetch: `GET /feed`
- Subsequent fetches: `GET /feed?cursor={nextCursor}`
- Response contains: `{ posts: Post[], nextCursor: string | null }`
- `nextCursor` is `null` when no more posts available
- Intersection Observer API triggers fetch when user scrolls near bottom (see `src/pages/Feed.tsx`)

### Type Definitions
Key types are defined in `src/types/`:
- `feed.ts` - `Post`, `FeedHeaderProps`, `PostsListProps`
- `post.ts` - `Comment`, `PostDetailsData`

## UI Component System (Shadcn/ui)

This project uses Shadcn/ui, which is NOT a component library but a collection of reusable components:
- Components are copied into the project (not installed as dependencies)
- Built on Radix UI primitives with Tailwind CSS styling
- Located in `src/components/ui/`
- Uses class-variance-authority (cva) for variant management
- Uses `clsx` and `tailwind-merge` for conditional styling
- To add new components: use the shadcn CLI (not documented here, refer to Shadcn docs)

Common UI components available:
- button, card, dialog, dropdown-menu, input, label, select, textarea
- avatar, alert-dialog, switch, tabs, tooltip, badge, sheet

## Styling Conventions
- Tailwind CSS utility classes for all styling
- CSS variables for theme colors (defined in index.css)
- Responsive design with `md:` and `lg:` breakpoints
- Mobile-first approach with responsive components (e.g., separate `mobileSidebarOpen` state)
- Dark mode support via CSS variables

## Real-time Features
Chat functionality uses **Socket.io-client**:
- Connection established in `src/pages/Chat.tsx`
- Listens for events: `message`, `typing`, etc.
- Emits events: `sendMessage`, `typing`, etc.

## Development Notes
- TypeScript strict mode is enabled
- ESLint is configured with React and React Hooks plugins
- No test framework is currently configured
- The project uses ES modules (`"type": "module"` in package.json)
