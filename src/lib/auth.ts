import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { connectDB } from './db';
import User from '@/models/User';
import './auth-types';
import {
  SECURITY_CONFIG,
  extractClientIp,
  checkIpRateLimit,
  recordFailedIpAttempt,
  resetIpAttempt,
} from './security';

class UserNotFoundError extends CredentialsSignin {
  code = 'USER_NOT_FOUND';
}

class GoogleAccountError extends CredentialsSignin {
  code = 'GOOGLE_ACCOUNT';
}

class InvalidPasswordError extends CredentialsSignin {
  code = 'INVALID_PASSWORD';
}

class WarningLastAttemptError extends CredentialsSignin {
  code = 'WARNING_LAST_ATTEMPT';
}

class AccountLockedError extends CredentialsSignin {
  code = 'ACCOUNT_LOCKED';
}

class IpBlockedError extends CredentialsSignin {
  code = 'IP_BLOCKED';
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const clientIp = extractClientIp(req);
        const ipStatus = checkIpRateLimit(clientIp);
        if (ipStatus.isBlocked) {
          throw new IpBlockedError();
        }

        await connectDB();
        const email = (credentials.email as string).toLowerCase().trim();
        const user = await User.findOne({
          email,
          accountStatus: 'active',
        });

        if (!user) {
          recordFailedIpAttempt(clientIp);
          throw new UserNotFoundError();
        }

        if (!user.passwordHash) {
          throw new GoogleAccountError();
        }

        const now = new Date();

        // Check if account is currently locked
        if (user.lockoutUntil && user.lockoutUntil > now) {
          throw new AccountLockedError();
        }

        // If lockout expired, reset counters
        if (user.lockoutUntil && user.lockoutUntil <= now) {
          user.failedLoginAttempts = 0;
          user.lockoutUntil = null;
          await user.save();
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

        if (!isValid) {
          recordFailedIpAttempt(clientIp);
          const currentAttempts = (user.failedLoginAttempts || 0) + 1;
          user.failedLoginAttempts = currentAttempts;

          if (currentAttempts >= SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS) {
            user.lockoutUntil = new Date(Date.now() + SECURITY_CONFIG.ACCOUNT_LOCKOUT_DURATION_MS);
            await user.save();
            throw new AccountLockedError();
          } else {
            await user.save();
            if (currentAttempts === SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS - 1) {
              throw new WarningLastAttemptError();
            }
            throw new InvalidPasswordError();
          }
        }

        // Successful password authentication: reset IP and account failed attempts
        resetIpAttempt(clientIp);
        if ((user.failedLoginAttempts && user.failedLoginAttempts > 0) || user.lockoutUntil) {
          user.failedLoginAttempts = 0;
          user.lockoutUntil = null;
          await user.save();
        }

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
  session: {
    strategy: 'jwt',
    maxAge: SECURITY_CONFIG.SESSION_MAX_AGE_SECONDS, // 15 minutes session expiry
  },
});
