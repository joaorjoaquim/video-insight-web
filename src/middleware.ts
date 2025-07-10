import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is trying to access private routes
  if (pathname.startsWith('/private')) {
    // Check for auth token in cookies or headers
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect to public landing page if no token
      return NextResponse.redirect(new URL('/public', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/private/:path*',
  ],
}; 