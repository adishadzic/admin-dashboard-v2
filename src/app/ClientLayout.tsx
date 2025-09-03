'use client';

import Protected from '@/components/Protected';
import ResponsiveLayout from './ResponsiveLayout';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/login')) {
    return <>{children}</>;
  }

  return (
    <Protected>
      <ResponsiveLayout>{children}</ResponsiveLayout>
    </Protected>
  );
}
