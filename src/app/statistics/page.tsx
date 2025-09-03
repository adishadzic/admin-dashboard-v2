'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RequireProfessor } from '@/components/guards';
import { db } from '@/lib/firebaseClient';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

type AttemptFS = {
  testId: string;
  testName?: string;
  studentId: string;
  studentName?: string;
  percent: number;
  submittedAt: number;
};

type StudentFS = {
  fullName?: string;
};

type TestFS = {
  name?: string;
};

type Attempt = AttemptFS & { id: string };
type Student = { id: string; fullName?: string };
type Test = { id: string; name?: string };

function formatWhen(ms?: number): string {
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleString('hr-HR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StatisticsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const unsubAttempts = onSnapshot(
      query(collection(db, 'attempts'), orderBy('submittedAt', 'desc')),
      (snap) => {
        const rows: Attempt[] = snap.docs.map((d) => {
          const raw = d.data() as Partial<AttemptFS>;
          return {
            id: d.id,
            testId: String(raw.testId ?? ''),
            testName: raw.testName,
            studentId: String(raw.studentId ?? ''),
            studentName: raw.studentName,
            percent: Number(raw.percent ?? 0),
            submittedAt: Number(raw.submittedAt ?? 0),
          };
        });
        setAttempts(rows);
      }
    );

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const rows: Student[] = snap.docs.map((d) => {
        const raw = d.data() as Partial<StudentFS>;
        return { id: d.id, fullName: raw.fullName };
      });
      setStudents(rows);
    });

    const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
      const rows: Test[] = snap.docs.map((d) => {
        const raw = d.data() as Partial<TestFS>;
        return { id: d.id, name: raw.name };
      });
      setTests(rows);
    });

    return () => {
      unsubAttempts();
      unsubStudents();
      unsubTests();
    };
  }, []);

  const studentNameById = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach((s) => m.set(s.id, s.fullName ?? s.id));
    return m;
  }, [students]);

  const testNameById = useMemo(() => {
    const m = new Map<string, string>();
    tests.forEach((t) => m.set(t.id, t.name ?? t.id));
    return m;
  }, [tests]);

  const totalAttempts = attempts.length;
  const activeStudents = students.length;

  const averageScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, a) => acc + (a.percent || 0), 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  // Completion Rate (last 30 days): unique students with ≥1 attempt / total students
  const completionRate = useMemo(() => {
    if (activeStudents === 0) return 0;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - THIRTY_DAYS;
    const uniqueRecent = new Set(
      attempts
        .filter((a) => a.submittedAt && a.submittedAt >= cutoff)
        .map((a) => a.studentId)
    );
    return Math.round((uniqueRecent.size / activeStudents) * 100);
  }, [attempts, activeStudents]);

  const recent = attempts.slice(0, 12);

  return (
    <RequireProfessor>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistika</h1>
          <Button disabled onClick={() => { /* reserved for export */ }}>
            Generate Report
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Ukupno pokušaja" value={String(totalAttempts)} icon={BookOpen} color="bg-blue-500" />
          <KpiCard title="Aktivni studenti" value={String(activeStudents)} icon={Users} color="bg-green-500" />
          <KpiCard title="Prosječni rezultat" value={`${averageScore}%`} icon={TrendingUp} color="bg-purple-500" />
          <KpiCard title="Postotak riješenosti (30d)" value={`${completionRate}%`} icon={BarChart3} color="bg-orange-500" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

          {recent.length === 0 ? (
            <div className="text-sm text-gray-500">Nema nedavnih aktivnosti.</div>
          ) : (
            <div className="space-y-3">
              {recent.map((a) => {
                const sName = a.studentName || studentNameById.get(a.studentId) || a.studentId;
                const tName = a.testName || testNameById.get(a.testId) || a.testId;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1 text-gray-800">
                      <span className="font-medium">
                        <Link href={`/students/${a.studentId}`} className="hover:underline">
                         Student {sName}
                        </Link>
                      </span>{' '}
                      riješio je kontrolnu zadaću{' '}
                      <span className="font-medium">
                        <Link href={`/tests/${a.testId}`} className="hover:underline">
                          {tName}
                        </Link>
                      </span>{' '}
                      – {Math.round(a.percent)}%
                    </div>
                    <div className="text-sm text-gray-500">{formatWhen(a.submittedAt)}</div>
                    <Link href={`/attempts/${a.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                      Detalji
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RequireProfessor>
  );
}

/* ---------- Presentational ---------- */
type IconType = React.ComponentType<{ className?: string }>;

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: IconType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
