"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import type { Student } from "@/types/student";
import StudentProfilePage from "@/components/StudentProfilePage";

export default function StudentDetailClient({ id }: { id: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const ref = doc(db, "students", id);
        const snap = await getDoc(ref);

        if (!active) return;

        if (snap.exists()) {
          const data = snap.data() as Omit<Student, "id">;
          const mapped: Student = { id: snap.id, ...data };
          setStudent(mapped);
        } else {
          setStudent(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Učitavam studenta…</div>;
  if (!student) return <div className="p-6">Student nije pronađen.</div>;

  return <StudentProfilePage student={student} />;
}
