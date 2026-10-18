import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'admin';
      onboardingCompleted: boolean;
    } & DefaultSession['user'];
  }
  interface User {
    role?: 'student' | 'admin';
    onboardingCompleted?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: 'student' | 'admin';
    onboardingCompleted?: boolean;
  }
}
