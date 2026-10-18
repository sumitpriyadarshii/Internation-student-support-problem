import React, { Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthProvider from '@/components/providers/AuthProvider';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <DashboardLayout>{children}</DashboardLayout>
      </Suspense>
    </AuthProvider>
  );
}
