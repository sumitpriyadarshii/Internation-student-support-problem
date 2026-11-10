import dns from 'dns';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

function ensureReliableDnsForSrv() {
  if (!MONGODB_URI.startsWith('mongodb+srv://')) return;
  try {
    const current = dns.getServers();
    if (
      current.length === 0 ||
      current.every((s) => s === '127.0.0.1' || s === '::1')
    ) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      dns.promises?.setServers?.(['8.8.8.8', '1.1.1.1']);
    }
  } catch {}
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  ensureReliableDnsForSrv();
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
