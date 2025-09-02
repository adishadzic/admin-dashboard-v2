// src/components/guards.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

type Props = { children: React.ReactNode };

/**
 * Blocks everything while auth is loading.
 * If no user -> redirect to /login.
 */
export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    // allow /login without redirect loop
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, router, pathname]);

  if (loading) return <div className="p-6 text-gray-500">Učitavanje…</div>;
  if (!user) return null; // we're redirecting

  return <>{children}</>;
}

/**
 * Only allows professors. Others are redirected to /profile.
 */
export function RequireProfessor({ children }: Props) {
  const role = useRole(); // 'professor' | 'student' | null (loading)
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role === null) return; // still resolving
    if (role !== 'professor' && pathname !== '/profile') {
      router.replace('/profile');
    }
  }, [role, router, pathname]);

  if (role === null) return <div className="p-6 text-gray-500">Učitavanje…</div>;
  if (role !== 'professor') return null; // redirecting

  return <>{children}</>;
}

/**
 * Only allows students. Others are redirected to /profile (or wherever you prefer).
 */
export function RequireStudent({ children }: Props) {
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role === null) return;
    if (role !== 'student' && pathname !== '/profile') {
      router.replace('/profile');
    }
  }, [role, router, pathname]);

  if (role === null) return <div className="p-6 text-gray-500">Učitavanje…</div>;
  if (role !== 'student') return null;

  return <>{children}</>;
}
