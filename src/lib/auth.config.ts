import './env-sanitize';
import type { NextAuthConfig } from 'next-auth';
import './auth-types';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        if (user.role) {
          token.role = user.role;
        }
        if (typeof user.onboardingCompleted === 'boolean') {
          token.onboardingCompleted = user.onboardingCompleted;
        }
      }
      if (trigger === 'update' && session) {
        if (typeof session.onboardingCompleted === 'boolean') {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'student' | 'admin') || 'student';
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl, headers } = request;
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as { role?: string })?.role === 'admin';
      const pathname = nextUrl.pathname;

      // Determine robust public origin so redirects NEVER point to localhost in production
      const host = headers?.get?.('x-forwarded-host') || headers?.get?.('host') || nextUrl.host || 'internationalstudentplatform.vercel.app';
      const proto = headers?.get?.('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const origin = `${proto}://${host}`;
      const toUrl = (path: string) => new URL(path, origin);

      // Protect student routes
      const studentRoutes = [
        '/dashboard',
        '/guides',
        '/tasks',
        '/buddies',
        '/community',
        '/profile',
        '/settings',
        '/notifications',
      ];
      const isStudentRoute = studentRoutes.some((r) => pathname.startsWith(r));

      // Protect student routes (must be logged in)
      if (isStudentRoute && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
        return Response.redirect(toUrl(`/login?callbackUrl=${callbackUrl}`));
      }

      const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
      if (isAdminRoute && !isAdmin) {
        if (!isLoggedIn) {
          return Response.redirect(toUrl('/admin-login'));
        }
        return Response.redirect(toUrl('/dashboard'));
      }

      if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
        if (isAdmin) return Response.redirect(toUrl('/admin'));
        return Response.redirect(toUrl('/dashboard'));
      }

      // Admin login page — redirect if already logged in
      if (pathname === '/admin-login' && isLoggedIn) {
        if (isAdmin) return Response.redirect(toUrl('/admin'));
        return Response.redirect(toUrl('/dashboard'));
      }

      if (pathname.startsWith('/onboarding') && !isLoggedIn) {
        return Response.redirect(toUrl('/login?callbackUrl=%2Fonboarding'));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
