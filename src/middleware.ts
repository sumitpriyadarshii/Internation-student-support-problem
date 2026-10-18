import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/guides/:path*',
    '/tasks/:path*',
    '/buddies/:path*',
    '/community/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
