# VideoInsight Web

A modern Next.js application for video analysis and insights.

## Features

- **Authentication**: Email/password and OAuth (Google, Discord) login
- **Landing Page**: Beautiful public landing page with call-to-action
- **Dashboard**: Private dashboard for authenticated users
- **Redux Toolkit**: State management with authentication and dialog slices
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern styling with utility classes

## Project Structure

```
src/
├── app/
│   ├── public/          # Public landing page
│   ├── private/         # Protected dashboard pages
│   ├── auth/            # OAuth callback handling
│   └── layout.tsx       # Root layout with providers
├── components/          # Reusable UI components
├── core/
│   ├── slices/          # Redux Toolkit slices
│   ├── providers/       # Global providers
│   ├── hooks.ts         # Typed Redux hooks
│   └── store.ts         # Redux store configuration
├── lib/
│   ├── api/             # API client and functions
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware for auth
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Integration

The application integrates with the VideoInsight API:

- **Authentication**: `/auth/signup`, `/auth/login`, `/auth/oauth/:provider`
- **User Profile**: `/user/profile`
- **OAuth**: Google and Discord integration

## Authentication Flow

1. **Public Access**: Users can visit the landing page without authentication
2. **Sign Up/Login**: Users can create accounts or sign in via email/password or OAuth
3. **Protected Routes**: `/private/*` routes require authentication
4. **Session Management**: JWT tokens stored in localStorage and cookies

## Development

- **Redux DevTools**: Available in development mode
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Tailwind**: Utility-first CSS framework

## Deployment

The application is ready for deployment on Vercel, Netlify, or any Next.js-compatible platform.

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/oauth/:provider` - OAuth redirect
- `GET /auth/callback/:provider` - OAuth callback

### User Management
- `GET /user/profile` - Get authenticated user profile

## OAuth Providers

- **Google**: OAuth 2.0 integration
- **Discord**: OAuth 2.0 integration

Both providers redirect back to the frontend callback handler which stores the JWT token and redirects to the dashboard.
