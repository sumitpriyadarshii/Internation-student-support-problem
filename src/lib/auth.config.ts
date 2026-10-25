import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
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

      if (pathname.startsWith('/admin') && !isAdmin) {
        if (!isLoggedIn) return false;
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
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
