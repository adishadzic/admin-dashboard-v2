'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (pathname?.startsWith('/login')) return;

    const email = user?.email ?? '';
    const isStudent = email.endsWith('@student.unipu.hr');
    const isProfessor = email.endsWith('@unipu.hr');

    if (!user || (!isStudent && !isProfessor)) {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div className="p-8 text-gray-600">Učitavanje…</div>;
  }

  return <>{children}</>;
}
