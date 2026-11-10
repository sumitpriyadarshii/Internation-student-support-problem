import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models';

// One-time migration endpoint — protected by a secret key
// DELETE this file after running once!
const MIGRATION_SECRET = 'ffh-migrate-2026-secret-xK9pQ';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find old admin by old email OR by role=admin
    const oldAdmin = await User.findOne({
      $or: [{ email: 'admin@farfromhome.com' }, { role: 'admin' }],
    });

    if (!oldAdmin) {
      return NextResponse.json({ error: 'No admin user found in database' }, { status: 404 });
    }

    const newPasswordHash = await bcrypt.hash('@Sumit20', 10);

    await User.updateOne(
      { _id: oldAdmin._id },
      {
        $set: {
          email: 'sumit@admin.com',
          passwordHash: newPasswordHash,
          name: 'Sumit (Admin)',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully',
      oldEmail: oldAdmin.email,
      newEmail: 'sumit@admin.com',
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
