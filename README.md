# SummaryVideos Web

A modern Next.js 15 application for video analysis and insights with real-time processing status updates.

**Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/)  
**API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)  
**API Endpoint**: [https://api.summaryvideos.com/](https://api.summaryvideos.com/)

## 🚀 Features

- **Authentication**: Email/password and OAuth (Google, Discord) login
- **Real-time Polling**: Individual status polling for video processing
- **Smart Error Handling**: Comprehensive 404, error boundaries, and auto-redirects
- **Beautiful UI**: Modern design with dark mode support
- **Redux Toolkit**: State management with authentication and dialog slices
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern styling with utility classes
- **TanStack Query**: Advanced API integration with caching and polling

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/        # Public landing page
│   ├── (private)/       # Protected dashboard pages
│   │   ├── dashboard/   # Main dashboard with submissions
│   │   ├── wallet/      # Credits and account management
│   │   └── submissions/ # Individual submission details
│   ├── auth/            # OAuth callback handling
│   ├── error.tsx        # Client error boundary
│   ├── global-error.tsx # Global error boundary
│   ├── not-found.tsx    # 404 page with auto-redirect
│   └── layout.tsx       # Root layout with providers
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── submissions/     # Submission-related components
│   ├── insights/        # Analysis and insights components
│   ├── layout/          # Layout components
│   └── faq/            # FAQ accordion component
├── core/
│   ├── slices/          # Redux Toolkit slices
│   ├── providers/       # Global providers (Redux, Query)
│   ├── hooks.ts         # Typed Redux hooks
│   └── store.ts         # Redux store configuration
├── lib/
│   ├── api/             # API client and functions
│   │   ├── hooks.ts     # TanStack Query hooks
│   │   ├── videoInsightApi.ts # API functions
│   │   └── axios.ts     # HTTP client configuration
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware for auth & security
```

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.summaryvideos.com
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔐 Authentication Flow

1. **Public Access**: Users can visit the landing page without authentication
2. **Sign Up/Login**: Users can create accounts or sign in via email/password or OAuth
3. **Protected Routes**: `/dashboard`, `/wallet`, `/submissions/*` require authentication
4. **Session Management**: JWT tokens stored in cookies and headers
5. **Auto-redirect**: Unauthenticated users → home page

## 🎯 API Integration

The application integrates with the SummaryVideos API using **TanStack Query**:

### Core Endpoints
- **Authentication**: `/auth/signup`, `/auth/login`, `/auth/oauth/:provider`
- **User Profile**: `/user/profile`
- **Video Processing**: `/video`, `/video/:id`, `/video/:id/status`
- **Credits**: `/credits` (for wallet management)

### Real-time Features
- **Individual Polling**: Each submission card polls its own status
- **Smart Caching**: Automatic cache invalidation and background updates
- **Optimistic Updates**: Immediate UI feedback for video submissions
- **Error Handling**: Sophisticated retry logic and error states

## 🛡️ Security & Error Handling

### Middleware Protection
- **Protected Routes**: `/dashboard`, `/wallet`, `/submissions/*`
- **Token Validation**: Checks `auth_token` cookie or `Authorization` header
- **Security Headers**: CSP, X-Frame-Options, Content-Type-Options
- **Smart Redirects**: Handles trailing slashes and common typos

### Error Boundaries
- **404 Page**: Auto-redirects to home after 5 seconds
- **Client Errors**: Auto-redirects after 8 seconds with retry options
- **Global Errors**: Auto-redirects after 10 seconds for critical errors
- **Development Mode**: Shows detailed error information

## 🎨 UI/UX Features

### Modern Design
- **Dark Mode**: Full dark/light theme support
- **Responsive**: Mobile-first design with responsive components
- **Loading States**: Beautiful loading animations and skeletons
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

### User Experience
- **Real-time Updates**: Live status updates for video processing
- **Progress Indicators**: Visual progress bars for processing videos
- **Smart Navigation**: Active state indicators in navigation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🔧 Development Features

- **Redux DevTools**: Available in development mode
- **React Query DevTools**: For API debugging and cache inspection
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Tailwind**: Utility-first CSS framework

## 🚀 Deployment

The application is ready for deployment on Vercel, Netlify, or any Next.js-compatible platform.

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=https://api.summaryvideos.com
```

## 📊 Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: TanStack Query smart caching strategies
- **Background Updates**: Automatic background refetching
- **Lazy Loading**: Component and route lazy loading

## 🔄 Real-time Processing

### Individual Polling System
- **Smart Polling**: Only polls pending, downloaded, transcribing videos
- **Auto-stop**: Stops polling when status becomes completed/failed
- **Visual Feedback**: Spinning indicators during polling
- **Progress Updates**: Real-time progress percentage display

### Status Management
- **Status Types**: pending, downloaded, transcribing, completed, failed
- **Progress Tracking**: Percentage completion for processing videos
- **Error Handling**: Graceful handling of processing failures
- **Cache Management**: Automatic cache updates on status changes

## 🎯 Key Technologies

- **Next.js 15**: App Router with route groups
- **React 18**: Concurrent features and Suspense
- **TypeScript**: Full type safety
- **TanStack Query**: Advanced API state management
- **Redux Toolkit**: Global state management
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Hugeicons**: Modern icon library

## 📈 Scalability

- **Modular Architecture**: Clean separation of concerns
- **Reusable Components**: Component library with consistent design
- **API Abstraction**: Centralized API layer with hooks
- **Type Safety**: Comprehensive TypeScript coverage
- **Testing Ready**: Easy to add unit and integration tests

## 👨‍💻 Author

**João Ricardo Joaquim** - [@joaorjoaquim](https://github.com/joaorjoaquim)

- **GitHub**: [https://github.com/joaorjoaquim](https://github.com/joaorjoaquim)
- **Live Demo**: [https://summaryvideos.com/](https://summaryvideos.com/)
- **API Repository**: [https://github.com/joaorjoaquim/video-insight-api](https://github.com/joaorjoaquim/video-insight-api)

This implementation demonstrates **senior-level architecture decisions** with production-ready features, excellent user experience, and maintainable code structure.
