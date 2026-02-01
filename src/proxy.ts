import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Protected routes configuration
const protectedRoutes = [
  '/checkout',
  '/orders',
  '/account',
  '/wishlist',
];

const authRoutes = ['/login', '/register', '/reset-password'];

/**
 * Check if user has a valid JWT token
 * Token is stored in localStorage on client, but for middleware
 * we check for presence of access token in cookies or Authorization header
 */
function isAuthenticated(request: NextRequest): boolean {
  // Check Authorization header (for API calls)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return isValidToken(token);
  }

  // Check for token in cookies (if using httpOnly cookies)
  const accessToken = request.cookies.get('accessToken')?.value;
  if (accessToken) {
    return isValidToken(accessToken);
  }

  return false;
}

/**
 * Validate JWT token expiration (basic client-side check)
 */
function isValidToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  // Server-side auth check disabled in favor of client-side AuthGuard
  // because we are using localStorage which is not accessible here.
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
