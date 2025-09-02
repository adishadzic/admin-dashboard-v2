'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { collection, onSnapshot } from 'firebase/firestore';

type AttemptFS = {
  percent?: number;
  submittedAt?: number; 
  studentId?: string;
};

export function useAttemptsSummary() {
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [averagePercent, setAveragePercent] = useState(0);
  const [completion30d, setCompletion30d] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attempts'), (snap) => {
      const rows = snap.docs.map((d) => d.data() as AttemptFS);
      const total = rows.length;

      const percents = rows.map((r) => Number(r.percent ?? 0));
      const avg = percents.length
        ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
        : 0;

      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentStudentIds = new Set(
        rows.filter(r => (r.submittedAt ?? 0) >= cutoff && r.studentId)
            .map(r => String(r.studentId))
      );

      setTotalAttempts(total);
      setAveragePercent(avg);
      setCompletion30d(recentStudentIds.size);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { totalAttempts, averagePercent, completion30d, loading };
}
