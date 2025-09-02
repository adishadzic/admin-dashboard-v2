'use client';

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { Mail, UserCircle2, LogOut, BadgeCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import StudentProfilePage from '@/components/StudentProfilePage';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { Student, StudentDoc, StudentYear } from '@/types/student';

function hiResPhoto(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/s\d+-c\//, '/s256-c/');
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const role = useRole();

  const [studentDoc, setStudentDoc] = useState<Student | null>(null);

  useEffect(() => {
    let active = true;
  
    async function loadStudent() {
      if (!user || role !== 'student') {
        if (active) setStudentDoc(null);
        return;
      }
  
      const ref = doc(db, 'students', user.uid);
      const snap = await getDoc(ref);
  
      if (!active) return;
  
      if (snap.exists()) {
        const raw = snap.data() as Partial<StudentDoc>;
  
        const year: StudentYear =
          raw.year === 1 || raw.year === 2 || raw.year === 3 || raw.year === 4 || raw.year === 5
            ? raw.year
            : 1;
  
        const mapped: Student = {
          id: snap.id,
          fullName: raw.fullName ?? user.displayName ?? 'Nepoznato ime',
          email: raw.email ?? user.email ?? '',
          jmbag: raw.jmbag ?? '',
          year,
          avatarUrl: raw.avatarUrl ?? undefined,
          testsCompleted: raw.testsCompleted ?? 0,
          averageScore: raw.averageScore ?? 0,
          lastActive: raw.lastActive ?? undefined,
          authUid: raw.authUid ?? user.uid,
          createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
        };
  
        setStudentDoc(mapped);
      } else {
        const fallback: Student = {
          id: user.uid,
          fullName: user.displayName ?? 'Nepoznato ime',
          email: user.email ?? '',
          jmbag: '',
          year: 1,
          avatarUrl: user.photoURL ?? undefined,
          testsCompleted: 0,
          averageScore: 0,
          lastActive: undefined,
          authUid: user.uid,
          createdAt: Date.now(),
        };
        setStudentDoc(fallback);
      }
    }
  
    loadStudent();
    return () => {
      active = false;
    };
  }, [user, role]);
  

  if (loading) {
    return <div className="p-8 text-gray-500">Učitavanje…</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Prossfil</h1>
        <p className="text-gray-600">Niste prijavljeni.</p>
      </div>
    );
  }

  if (role === 'student') {
    return <StudentProfilePage student={studentDoc} />;
  }

  const photo = hiResPhoto(user.photoURL);
  const name = user.displayName ?? 'Nepoznato ime';
  const email = user.email ?? '—';

  const badge =
    role === 'professor' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ml-2 align-middle">
        <BadgeCheck className="w-3 h-3" />
        Profesor
      </span>
    ) : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-6">
          {photo ? (
            <Image
              src={photo}
              alt="Profile picture"
              width={96}
              height={96}
              className="rounded-full border"
              priority
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center border">
              <UserCircle2 className="w-12 h-12 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <div className="text-lg font-medium text-gray-900 flex items-center">
              <span>{name}</span>
              {badge}
            </div>

            <div className="mt-1 inline-flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://myaccount.google.com/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                Manage Google Account
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut(auth)}
                className="inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
