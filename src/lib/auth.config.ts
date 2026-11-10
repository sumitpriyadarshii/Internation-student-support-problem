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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as { role?: string })?.role === 'admin';
      const isOnboardingCompleted = (auth?.user as { onboardingCompleted?: boolean })?.onboardingCompleted;
      const pathname = nextUrl.pathname;

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
        return false;
      }

      const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
      if (isAdminRoute && !isAdmin) {
        if (!isLoggedIn) return false;
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Admin login page — redirect if already logged in
      if (pathname === '/admin-login' && isLoggedIn) {
        if (isAdmin) return Response.redirect(new URL('/admin', nextUrl));
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (pathname.startsWith('/onboarding') && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
