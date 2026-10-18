import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { connectDB } from './db';
import User from '@/models/User';
import './auth-types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
          accountStatus: 'active',
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
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
  },
  session: { strategy: 'jwt' },
});
