import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { connectDB } from './db';
import User from '@/models/User';
import './auth-types';

class UserNotFoundError extends CredentialsSignin {
  code = 'USER_NOT_FOUND';
}

class GoogleAccountError extends CredentialsSignin {
  code = 'GOOGLE_ACCOUNT';
}

class InvalidPasswordError extends CredentialsSignin {
  code = 'INVALID_PASSWORD';
}

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
        if (!user) throw new UserNotFoundError();
        if (!user.passwordHash) throw new GoogleAccountError();
        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) throw new InvalidPasswordError();
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      if (!user.email) return false;

      await connectDB();
      const email = user.email.toLowerCase();
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        if (existingUser.accountStatus !== 'active') return false;
        user.id = existingUser._id.toString();
        user.name = existingUser.name;
        user.role = existingUser.role;
        user.onboardingCompleted = existingUser.onboardingCompleted;
        return true;
      }

      const newUser = await User.create({
        name: user.name?.trim() || email.split('@')[0],
        email,
        role: 'student',
        accountStatus: 'active',
        onboardingCompleted: false,
        onboardingStep: 0,
        profile: {
          profileImage: user.image || '',
          languagesSpoken: [],
          interests: [],
          supportPreferences: [],
        },
      });

      user.id = newUser._id.toString();
      user.role = newUser.role;
      user.onboardingCompleted = newUser.onboardingCompleted;
      return true;
    },
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
