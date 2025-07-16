import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/wallet', 
  '/submissions',
  // Add other private routes here
];

// Public routes that are always accessible
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/api/auth',
  // Add other public routes here
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle trailing slashes - redirect to non-trailing slash version
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1), request.url)
    );
  }

  // Handle common typos and redirects
  const redirects: Record<string, string> = {
    '/home': '/',
    '/index': '/',
    '/main': '/',
    '/dashboard/': '/dashboard',
    '/wallet/': '/wallet',
  };

  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url));
  }

  // Handle legacy routes or common misspellings
  if (pathname.startsWith('/submission/')) {
    // Redirect /submission/ to /submissions/
    const newPath = pathname.replace('/submission/', '/submissions/');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if it's a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's neither protected nor public, assume it's public
  if (!isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect to home page if not authenticated
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // For public routes, allow access
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 