'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, router, pathname]);

  if (loading) return <div className="p-6 text-gray-500">Učitavanje…</div>;
  if (!user) return null;

  return <>{children}</>;
}

export function RequireProfessor({ children }: Props) {
  const role = useRole(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role === null) return;
    if (role !== 'professor' && pathname !== '/profile') {
      router.replace('/profile');
    }
  }, [role, router, pathname]);

  if (role === null) return <div className="p-6 text-gray-500">Učitavanje…</div>;
  if (role !== 'professor') return null;

  return <>{children}</>;
}

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
