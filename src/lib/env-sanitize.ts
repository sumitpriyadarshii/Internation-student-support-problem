/**
 * Environment Sanitizer
 *
 * In production or on Vercel, if AUTH_URL or NEXTAUTH_URL is accidentally set
 * to localhost (e.g. copied from .env.example into Vercel environment variables),
 * this overrides them with the actual production domain so NextAuth never
 * redirects users or sets callback cookies pointing to localhost:3000.
 */

function sanitizeAuthEnv() {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL);
  const isProd = process.env.NODE_ENV === 'production' || isVercel;

  if (isProd) {
    const rawAuthUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || '';
    const isLocalhost = rawAuthUrl.includes('localhost') || rawAuthUrl.includes('127.0.0.1');

    if (isLocalhost || !rawAuthUrl) {
      const prodHost =
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL ||
        'internationalstudentplatform.vercel.app';

      const cleanHost = prodHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const prodUrl = `https://${cleanHost}`;

      process.env.AUTH_URL = prodUrl;
      process.env.NEXTAUTH_URL = prodUrl;
    }
  }
}

sanitizeAuthEnv();

export { sanitizeAuthEnv };
