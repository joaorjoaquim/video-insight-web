import { NextRequest, NextResponse } from 'next/server';

// Rotas que requerem autenticação
const PROTECTED_ROUTES = [
  '/dashboard',
  '/wallet', 
  '/submissions',
  // Adicione outras rotas privadas aqui
];

// Rotas que são sempre públicas
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/api/auth',
  // Adicione outras rotas públicas aqui
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Verificar se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Se não é nem protegida nem pública, assumir que é pública
  if (!isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar autenticação
  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirecionar para a página inicial se não autenticado
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Para rotas públicas, permitir acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 