# Route Structure - SummaryVideos

## Overview

This implementation utilizes **Next.js 15 App Router** with **Route Groups** to organize public and private routes cleanly and securely, without exposing internal structure in URLs. Includes comprehensive error handling and individual polling for real-time updates.

**Repository**: [https://github.com/joaorjoaquim/video-insight-web](https://github.com/joaorjoaquim/video-insight-web)  
**API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)  
**Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/)  
**API Endpoint**: [https://api.summaryvideos.com/](https://api.summaryvideos.com/)

## Folder Structure

```
src/app/
├── (public)/           # Route Group - Public routes (not in URL)
│   └── page.tsx        # Landing page (accessible via /)
├── (private)/          # Route Group - Private routes (not in URL)
│   ├── layout.tsx      # Layout that protects all private routes
│   ├── dashboard/      # Main dashboard (accessible via /dashboard)
│   │   └── page.tsx    # Dashboard with submissions list
│   ├── wallet/         # Wallet page (accessible via /wallet)
│   │   └── page.tsx    # Credits and account management
│   └── submissions/    # Individual submission details
│       └── [id]/
│           └── page.tsx # Submission detail page
├── auth/               # OAuth callback handling
│   └── callback/
│       └── page.tsx
├── error.tsx           # Client error boundary
├── global-error.tsx    # Global error boundary
├── not-found.tsx       # 404 page with auto-redirect
└── layout.tsx          # Root layout with providers
```

## Final URLs

- `/` - Landing page (unauthenticated users) or Dashboard (authenticated users)
- `/dashboard` - Main dashboard with submissions list (authenticated only)
- `/wallet` - Wallet/Credits page (authenticated only)
- `/submissions/:id` - Individual submission details (authenticated only)

## Security Implementation

### Middleware (`src/middleware.ts`)

```typescript
// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/wallet', 
  '/submissions',
];

// Security features
- Token validation in cookies and headers
- Redirects unauthenticated users to /
- Security headers (CSP, X-Frame-Options, etc.)
- Smart redirects for trailing slashes and typos
```

### Private Layout (`src/app/(private)/layout.tsx`)

```typescript
// Additional client-side protection
- Checks Redux authentication state
- Redirects unauthenticated users
- Shows loading state during verification
- Provides consistent layout for all private pages
```

### Root Page (`src/app/page.tsx`)

```typescript
// Smart routing logic
- Shows landing page for unauthenticated users
- Redirects authenticated users to /dashboard
- Prevents infinite loops with loading states
- Integrates landing page directly
```

## Authentication Flow

### 1. **Unauthenticated User Accesses `/`**
- ✅ Middleware allows access
- ✅ Root page shows landing page
- ✅ User can login via OAuth or email/password

### 2. **Authenticated User Accesses `/`**
- ✅ Middleware allows access
- ✅ Root page redirects to `/dashboard`
- ✅ Private layout verifies authentication
- ✅ Dashboard displays with submissions list

### 3. **Unauthenticated User Tries `/dashboard`**
- ❌ Middleware blocks access
- 🔄 Redirects to `/`
- ❌ Private layout also blocks (double protection)

### 4. **Authenticated User Accesses `/dashboard`**
- ✅ Middleware allows access
- ✅ Private layout verifies authentication
- ✅ Dashboard displays with real-time polling

### 5. **User Accesses `/submissions/123`**
- ✅ Middleware allows access (starts with `/submissions/`)
- ✅ Private layout verifies authentication
- ✅ Individual submission page with status polling

## Error Handling

### 404 Not Found (`src/app/not-found.tsx`)
- **Auto-redirect**: 5-second countdown to home page
- **Manual Actions**: "Go to Home" and "Go Back" buttons
- **Beautiful Design**: Gradient background with robot emoji
- **User-Friendly**: Clear messaging and helpful guidance

### Client Error Boundary (`src/app/error.tsx`)
- **Auto-redirect**: 8-second countdown for client errors
- **Multiple Actions**: Try Again, Go Back, Go Home
- **Development Mode**: Shows error details in development
- **Orange Theme**: Differentiates from 404 page

### Global Error Boundary (`src/app/global-error.tsx`)
- **Critical Errors**: 10-second redirect for server errors
- **Full HTML Structure**: Handles complete app crashes
- **Error Details**: Shows error message and digest
- **Red Theme**: Indicates critical system errors

## Real-time Features

### Individual Polling System

```typescript
// Each submission card polls independently
const shouldPoll = status === "pending" || status === "downloaded" || status === "transcribing";
const { data: statusData, isLoading: isPolling } = useVideoStatus(id, shouldPoll);

// Smart polling with auto-stop
refetchInterval: (query) => {
  const data = query.state.data;
  if (data?.status === "completed" || data?.status === "failed") {
    return false; // Stop polling
  }
  return 10000; // Poll every 10 seconds
}
```

### Status Management
- **Status Types**: pending, downloaded, transcribing, completed, failed
- **Progress Tracking**: Percentage completion for processing videos
- **Visual Feedback**: Spinning indicators during polling
- **Auto-stop**: Stops polling when completed/failed

## Navigation Features

### Active State Detection
```typescript
// Uses usePathname to detect current route
const pathname = usePathname();

// Conditional styling for active navigation
className={cn(
  "font-medium transition-colors",
  pathname === "/dashboard"
    ? "text-indigo-600 dark:text-indigo-400"
    : "text-zinc-700 dark:text-zinc-200 hover:text-indigo-600"
)}
```

### Navigation Structure
- **Dashboard**: Main page with submissions list
- **Wallet**: Credits and account management
- **GitHub**: External repository link
- **No Submissions Page**: Submissions accessed via dashboard

## Advantages of Current Structure

### 1. **Clean URLs**
- No internal structure exposure (`/public`, `/private`)
- Intuitive and professional URLs
- SEO-friendly structure

### 2. **Robust Security**
- Server-side protection (middleware)
- Client-side protection (layout)
- Double authentication verification
- Comprehensive error handling

### 3. **Clear Organization**
- Logical separation between public and private routes
- Easy maintenance and scalability
- Structure prepared for growth

### 4. **Performance**
- Route groups don't affect performance
- Automatic lazy loading
- Optimized code splitting
- Individual polling reduces server load

### 5. **User Experience**
- Real-time status updates
- Beautiful error pages with auto-redirects
- Active navigation indicators
- Smooth transitions and animations

## Adding New Routes

### Private Routes
1. Create folder in `src/app/(private)/new-route/`
2. Add `page.tsx` in the folder
3. Add route to `PROTECTED_ROUTES` in middleware
4. Route will be accessible via `/new-route`

### Public Routes
1. Create folder in `src/app/(public)/new-route/`
2. Add `page.tsx` in the folder
3. Route will be accessible via `/new-route`

## Implementation Example

```typescript
// src/app/(private)/new-route/page.tsx
'use client';
import { useAppSelector } from '../../../core/hooks';

export default function NewRoutePage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>New Route</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}
```

## Security Considerations

1. **Middleware**: First line of defense on server
2. **Private Layout**: Second line of defense on client
3. **State Verification**: Third line of defense in components
4. **Tokens**: Stored in secure cookies
5. **Redirects**: Always to secure routes
6. **Error Handling**: Comprehensive error boundaries
7. **Auto-redirects**: Graceful handling of errors

## Performance Features

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and routes loaded on demand
- **Caching**: TanStack Query smart caching
- **Background Updates**: Automatic background refetching
- **Individual Polling**: Efficient resource usage

This structure ensures that unauthenticated users never see private content, even during loading states, while providing excellent user experience with real-time updates and comprehensive error handling.

---

**Author**: João Ricardo Joaquim - [@joaorjoaquim](https://github.com/joaorjoaquim)  
**Repository**: [https://github.com/joaorjoaquim/video-insight-web](https://github.com/joaorjoaquim/video-insight-web)  
**API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)  
**Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/) 