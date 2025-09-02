"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  UserCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { Student, StudentYear } from "@/types/student";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import type { AttemptDoc } from "@/lib/attemptsRepo";

/** Red koji prikazujemo (može imati doslikan testName) */
type AttemptRow = AttemptDoc & { id: string };

/** Formatiranje datuma iz epoch ms */
function formatWhen(ms?: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleDateString("hr-HR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  student: Student | null;
}

const YEARS: StudentYear[] = [1, 2, 3, 4, 5];
const isValidJmbag = (v: string) => /^\d{10}$/.test(v ?? "");

export default function StudentProfilePage({ student }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const role = useRole();

  // Lokalna kopija prikazanih podataka radi optimističnog UI-ja
  const [localStudent, setLocalStudent] = useState<Student | null>(student);
  useEffect(() => setLocalStudent(student), [student]);

  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [jmbag, setJmbag] = useState<string>(student?.jmbag ?? "");
  const [year, setYear] = useState<StudentYear>(student?.year ?? 1);
  const [saving, setSaving] = useState(false);

  // Tko smije uređivati? profesor ili taj isti student
  const canEdit =
    !!localStudent &&
    ((role === "professor") || (role === "student" && user?.uid === localStudent.id));

  // Pretpostavka: id studenta === njegov auth UID (kako spremamo u /students)
  const targetUid = useMemo(() => localStudent?.id ?? null, [localStudent?.id]);

  useEffect(() => {
    if (!targetUid) {
      setAttempts([]);
      setLoadingAttempts(false);
      return;
    }

    setLoadingAttempts(true);

    const q = query(
      collection(db, "attempts"),
      where("studentId", "==", targetUid),
      orderBy("submittedAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: AttemptRow[] = snap.docs.map((d) => {
          const data = d.data() as AttemptDoc;
          return { id: d.id, ...data };
        });
        setAttempts(rows);
        setLoadingAttempts(false);
      },
      (err) => {
        console.error(err);
        toast({
          title: "Greška",
          description: "Ne mogu dohvatiti attempts.",
          variant: "destructive",
        });
        setLoadingAttempts(false);
      }
    );

    return () => unsub();
  }, [targetUid, toast]);

  // Backfill testName ako fali
  useEffect(() => {
    let active = true;

    async function enrichMissingNames() {
      const missing = attempts.filter((a) => !a.testName);
      if (missing.length === 0) return;

      const patched = await Promise.all(
        attempts.map(async (a) => {
          if (a.testName) return a;
          try {
            const snap = await getDoc(doc(db, "tests", a.testId));
            if (snap.exists()) {
              const testData = snap.data() as { name?: string };
              return { ...a, testName: testData?.name ?? a.testId };
            }
          } catch (e) {
            console.warn("Ne mogu dohvatiti test", a.testId, e);
          }
          return a;
        })
      );

      if (active) setAttempts(patched);
    }

    enrichMissingNames();
    return () => {
      active = false;
    };
  }, [attempts]);

  const testsCompleted = attempts.length;
  const avgScore = testsCompleted
    ? Math.round(attempts.reduce((acc, a) => acc + (a.percent ?? 0), 0) / testsCompleted)
    : 0;
  const lastActiveText = attempts[0]?.submittedAt
    ? formatWhen(attempts[0].submittedAt)
    : "—";

  // Foto prioritet: student.avatarUrl → Google auth photoURL → fallback
  const photo = localStudent?.avatarUrl ?? user?.photoURL ?? undefined;

  // Sync edit polja kad uđemo u edit
  useEffect(() => {
    if (editing) {
      setJmbag(localStudent?.jmbag ?? "");
      setYear(localStudent?.year ?? 1);
    }
  }, [editing, localStudent?.jmbag, localStudent?.year]);

  if (!localStudent) {
    return (
      <div className="p-6 text-center">
        <p>Student nije pronađen.</p>
      </div>
    );
  }

  const changed =
    jmbag !== (localStudent.jmbag ?? "") || year !== (localStudent.year ?? 1);
  const valid = isValidJmbag(jmbag) && YEARS.includes(year);

  async function handleSave() {
    if (!localStudent || !valid || !changed) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "students", localStudent.id), {
        jmbag,
        year,
      });
      // Optimistični update prikaza
      setLocalStudent((prev) => (prev ? { ...prev, jmbag, year } as Student : prev));
      setEditing(false);
    } catch (e) {
      console.error(e);
      toast({
        title: "Greška",
        description: "Spremanje nije uspjelo. Pokušajte ponovno.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Student Profile</h1>
        {canEdit && !editing && (
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            onClick={() => setEditing(true)}
          >
            Uredi
          </button>
        )}
      </div>

      {/* Student card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
          {photo ? (
            <Image
              src={
                // povećaj google avatar rezoluciju ako je u obliku /s96-c/
                photo.replace?.(/\/s\d+-c\//, "/s256-c/") ?? photo
              }
              alt="Student profile picture"
              width={128}
              height={128}
              className="rounded-full object-cover border"
              priority
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border">
              <UserCircle2 className="w-16 h-16 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{localStudent.fullName}</h2>
            <p className="text-muted-foreground">{localStudent.email}</p>

            {/* Prikaz / Uređivanje JMBAG + godina */}
            {!editing ? (
              <>
                <p className="text-sm text-gray-500">JMBAG: {localStudent.jmbag || "—"}</p>
                <p className="text-sm text-gray-500">Godina studija: {localStudent.year}.</p>
              </>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">JMBAG (10 znamenki)</label>
                  <input
                    value={jmbag}
                    onChange={(e) => setJmbag(e.target.value.trim())}
                    placeholder="npr. 0123456789"
                    className={`text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      jmbag && !isValidJmbag(jmbag) ? "border-red-400" : "border-gray-300"
                    }`}
                    maxLength={10}
                  />
                  {jmbag && !isValidJmbag(jmbag) && (
                    <span className="text-xs text-red-600 mt-1">
                      JMBAG mora imati točno 10 znamenki.
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Godina studija</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) as StudentYear)}
                    className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}. godina
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    disabled={!valid || !changed || saving}
                    className={`px-4 py-2 rounded-lg text-white ${
                      !valid || !changed || saving
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {saving ? "Spremam…" : "Spremi"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      // vrati form na trenutno spremljene vrijednosti
                      setJmbag(localStudent.jmbag ?? "");
                      setYear(localStudent.year ?? 1);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Odustani
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
            <p className="text-2xl font-bold">{testsCompleted}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold text-green-600">{avgScore}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 flex items-center space-x-4 card-hover">
          <div className="p-3 bg-purple-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Active</p>
            <p className="text-lg font-semibold">{lastActiveText}</p>
          </div>
        </div>
      </div>

      {/* Attempts table */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Moji testovi</h3>

        {loadingAttempts ? (
          <div className="text-sm text-gray-500">Učitavam pokušaje…</div>
        ) : attempts.length === 0 ? (
          <div className="text-sm text-gray-500">Student još nema pokušaja.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Postotak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Detalji
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {a.testName ?? a.testId}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.percent >= 50
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Math.round(a.percent)}%
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                      {formatWhen(a.submittedAt)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <Link
                        href={`/attempts/${a.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        Vidi detalje
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
