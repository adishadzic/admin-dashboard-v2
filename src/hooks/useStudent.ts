import { useEffect, useState } from "react";
import type { Student } from "@/types/student";
import { listenStudents } from "@/lib/studentsRepo";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsub = listenStudents(
      (rows) => {
        setStudents(rows);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { students, loading, error };
}
