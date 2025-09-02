import { db } from "@/lib/firebaseClient";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import type { Student, StudentDoc, StudentYear } from "@/types/student";

const COL = "students";

export function listenStudents(
  onData: (rows: Student[]) => void,
  onError: (err: string) => void
) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const rows: Student[] = snap.docs.map((d) => {
        const data = d.data() as Partial<StudentDoc>;
        return {
          id: d.id,
          email: data.email ?? "",
          fullName: data.fullName ?? "",
          year: (data.year as StudentYear) ?? 1,
          jmbag: data.jmbag ?? "",
          createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
        };
      });
      onData(rows);
    },
    (e) => onError(e.message ?? "Unknown Firestore error")
  );
  return unsub;
}

export async function addStudent(input: {
  email: string;
  fullName: string;
  year: StudentYear;
  jmbag: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    year: input.year,
    jmbag: input.jmbag.trim(),
    createdAt: Date.now(),
  } satisfies StudentDoc);
  return docRef.id;
}

export async function updateStudent(
  id: string,
  patch: Partial<Pick<StudentDoc, "email" | "fullName" | "year" | "jmbag">>
) {
  await updateDoc(doc(db, COL, id), patch);
}

export async function deleteStudentById(id: string) {
  await deleteDoc(doc(db, COL, id));
}
