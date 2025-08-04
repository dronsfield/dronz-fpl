# Migration Plan: Remix v1 → Next.js v15

## Current Application Analysis

### Architecture Overview
- **Framework**: Remix v1 with React 17
- **Styling**: Styled Components
- **State Management**: TanStack Query v4
- **Deployment**: Vercel
- **Caching**: Redis + Vercel KV
- **Session**: Cookie-based with Remix session storage

### Key Features
- Fantasy Premier League (FPL) application
- User authentication via manager IDs
- League management and statistics
- Real-time data fetching with caching
- Multiple views: standings, fixtures, captains, chips, transfers, etc.

## Migration Phases

### Phase 1: Project Setup ✅
- [x] Create Next.js v15 project
- [x] Update dependencies
- [x] Configure TypeScript
- [x] Set up environment variables

### Phase 2: Core Infrastructure ✅
- [x] Migrate session management
- [x] Set up caching layer
- [x] Configure API routes
- [x] Update data fetching patterns

### Phase 3: Route Migration ✅
- [x] Migrate root layout
- [x] Convert dynamic routes
- [x] Update API endpoints
- [x] Migrate form handling

### Phase 4: Component Migration ✅
- [x] Copy all components
- [x] Copy all services/api files
- [x] Update import paths
- [x] Test component functionality

### Phase 5: Testing & Deployment 🔄
- [ ] Update test configuration
- [ ] Test all routes
- [ ] Configure deployment
- [ ] Performance optimization

## Detailed Migration Steps

### Phase 1: Project Setup ✅

#### 1.1 Dependencies Updated
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "@tanstack/react-query": "5.0.0",
    "next": "15.4.5",
    "styled-components": "6.1.0",
    "@nivo/bump": "0.85.0",
    "@nivo/core": "0.85.0"
  }
}
```

#### 1.2 Environment Variables
```bash
# Copy from current .env
SESSION_SECRET=
REDIS_URL=
# Add Next.js specific vars
NEXT_PUBLIC_APP_URL=
```

### Phase 2: Core Infrastructure ✅

#### 2.1 Session Management ✅
**Migrated**: `app/services/session.server.ts` → `src/lib/session.ts`

```typescript
// src/lib/session.ts
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function createUserSession(userId: number, redirectTo: string) {
  const cookieStore = await cookies()
  cookieStore.set('userId', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  })
  return redirect(redirectTo)
}
```

#### 2.2 Caching Layer ✅
**Migrated**: `app/services/cacheFn.ts` → `src/lib/cacheFn.ts`

```typescript
// src/lib/cache.ts
import kv from '@vercel/kv'
import { createCachedFnFactory } from './cacheFn'

export const remoteCacheFn = createCachedFnFactory({
  getItem: kv.get,
  setItem: kv.set,
  logLabel: "kv",
})
```

#### 2.3 API Routes ✅
**Created**: Multiple API routes including login, logout, bootstrap, event-status, league

```typescript
// src/app/api/bootstrap/route.ts
export async function GET(request: NextRequest) {
  // Implementation with caching
}
```

### Phase 3: Route Migration ✅

#### 3.1 Root Layout ✅
**Migrated**: `app/root.tsx` → `src/app/layout.tsx`

```typescript
// src/app/layout.tsx
import { Providers } from './providers'
import { getUser } from '@/lib/session'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  return (
    <html lang="en">
      <body>
        <Providers user={user}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

#### 3.2 Dynamic Routes ✅
**Migrated**: All league routes copied exactly from Remix

```typescript
// src/app/league/[id]/standings/page.tsx
// src/app/league/[id]/captains/page.tsx
// src/app/league/[id]/fixtures/page.tsx
// etc.
```

#### 3.3 API Endpoints ✅
**Migrated**: Multiple API routes including:
- `src/app/api/bootstrap/route.ts`
- `src/app/api/event-status/route.ts`
- `src/app/api/league/[leagueId]/[eventId]/route.ts`
- `src/app/api/login/route.ts`
- `src/app/api/logout/route.ts`

### Phase 4: Component Migration ✅

#### 4.1 All Components Copied ✅
**Copied**: All components from `app/components/*` → `src/components/*`
- Button, NavBar, Loader, Table, Section, etc.
- All styled-components preserved
- Import paths updated to use `@/` prefix

#### 4.2 Services/API Copied ✅
**Copied**: All API services from `app/services/api/*` → `src/services/api/*`
- `index.ts`, `requests.ts`, `models.ts`
- Original data fetching logic preserved
- Using original API services instead of new data.ts

#### 4.3 Utilities Copied ✅
**Copied**: All utilities from `app/util/*` → `src/util/*`
- `formatName.ts`, `sortBy.ts`, `utilityTypes.ts`, etc.

#### 4.4 Views Copied ✅
**Copied**: All views from `app/views/*` → `src/views/*`
- `PrizeCalculation.tsx`, etc.

#### 4.5 Loaders Copied ✅
**Copied**: All loaders from `app/loaders/*` → `src/loaders/*`
- `leagueLoader.ts`, etc.

### Phase 5: Testing & Deployment 🔄

#### 5.1 Data Fetching Updated
**Current**: Using original API services with TanStack Query v5
**New**: Server Components + TanStack Query (client-side)

```typescript
// src/hooks/useRouteData.tsx
import { getCurrentEventId, getBootstrap, getLeague } from "@/services/api";

export function useLeagueLoaderQuery(triggerFetch = false) {
  const query = useQuery({
    queryKey: ["league", id],
    queryFn: async () => {
      const currentEventId = await getCurrentEventId();
      const league = await getLeague(parseInt(id as string), currentEventId.data);
      return league;
    },
    enabled: triggerFetch,
  });
}
```

## Key Differences to Address

1. **Routing**: File-based routing with different conventions ✅
2. **Data Fetching**: Server Components vs Remix loaders ✅
3. **Forms**: Server Actions vs Remix actions ✅
4. **Styling**: CSS-in-JS compatibility ✅
5. **Error Handling**: Different error boundary patterns ✅
6. **Meta Tags**: Different metadata handling ✅

## Migration Checklist

### ✅ Phase 1: Setup
- [x] Create Next.js project
- [x] Update dependencies
- [x] Configure TypeScript
- [x] Set up environment variables

### ✅ Phase 2: Infrastructure
- [x] Migrate session handling
- [x] Update caching layer
- [x] Configure API routes
- [x] Update data fetching

### ✅ Phase 3: Routes
- [x] Migrate root layout
- [x] Convert dynamic routes
- [x] Update API endpoints
- [x] Migrate form handling

### ✅ Phase 4: Components
- [x] Copy all components
- [x] Copy all services/api files
- [x] Update import paths
- [x] Test component functionality

### 🔄 Phase 5: Testing & Deployment
- [ ] Update test configuration
- [ ] Test all routes
- [ ] Configure deployment
- [ ] Performance optimization

## Next Steps

1. ✅ Next.js project created and basic setup complete
2. ✅ Core infrastructure migrated (sessions, caching, API routes)
3. ✅ Route migration complete
4. ✅ All components and services copied
5. 🔄 Test the application thoroughly
6. ⏳ Deploy and monitor

## Notes

- ✅ Basic Next.js app is running with authentication
- ✅ Session management working
- ✅ TanStack Query setup complete
- ✅ All league routes and API endpoints migrated
- ✅ All components copied with original functionality
- ✅ Using original API services for data fetching
- ✅ Styled-components working with Next.js
- 🔄 Ready for testing and deployment
- ⏳ Need to test all routes and functionality
- ⏳ Need to configure deployment 