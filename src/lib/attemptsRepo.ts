import { db } from "@/lib/firebaseClient";
import { addDoc, collection } from "firebase/firestore";
import type { UITest, Question } from "@/types/test";

export type AttemptAnswer = {
  questionId: string;
  value: string;
  isCorrect?: boolean | null;
  awardedPoints?: number;
};

export type AttemptDoc = {
  testId: string;
  testName?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submittedAt: number;
  status: "submitted" | "graded";
  answers: AttemptAnswer[];
  autoScore: number;
  manualScore: number;
  totalScore: number;
  maxScore: number;
  percent: number;
};

function computeMaxScore(test: UITest): number {
  return (test.questions ?? []).reduce((s, q) => s + (q.points ?? 1), 0);
}

function autoGrade(
  test: UITest,
  answers: AttemptAnswer[]
): { gradedAnswers: AttemptAnswer[]; autoScore: number } {
  const byId = new Map<string, Question>();
  for (const q of test.questions ?? []) byId.set(String(q.id), q);

  let auto = 0;
  const graded = answers.map((a) => {
    const q = byId.get(a.questionId);
    if (!q) return { ...a, isCorrect: false, awardedPoints: 0 };

    if (q.type === "mcq" || q.type === "truefalse") {
      const ok = (a.value ?? "").trim() === (q.correctAnswer ?? "").trim();
      const pts = ok ? (q.points ?? 1) : 0;
      auto += pts;
      return { ...a, isCorrect: ok, awardedPoints: pts };
    }

    return { ...a, isCorrect: null, awardedPoints: 0 };
  });

  return { gradedAnswers: graded, autoScore: auto };
}

/** Ukloni sva undefined polja (rekurzivno) iz objekta/arraya */
function pruneUndefined<T>(val: T): T {
  if (Array.isArray(val)) {
    // @ts-expect-error – vraćamo isti oblik
    return val.map(pruneUndefined);
  }
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = pruneUndefined(v as unknown);
    }
    // @ts-expect-error – vraćamo isti oblik
    return out;
  }
  return val;
}

/**
 * Spremi attempt:
 * - automatski boduje MCQ/TF
 * - denormalizira testName radi bržeg prikaza (ako postoji)
 * - nikad ne zapisuje `undefined` u Firestore
 */
export async function submitAttempt(params: {
  test: UITest;
  student: { uid: string; name?: string; email?: string };
  answers: AttemptAnswer[];
}): Promise<string> {
  const { test, student, answers } = params;

  const { gradedAnswers, autoScore } = autoGrade(test, answers);
  const max = computeMaxScore(test);
  const total = autoScore; // za sad bez manualScore
  const percent = max > 0 ? Math.round((total / max) * 100) : 0;

  const attempt: AttemptDoc = pruneUndefined({
    testId: String(test.id),
    ...(test.name ? { testName: test.name } : {}),
    studentId: student.uid,
    ...(student.name ? { studentName: student.name } : {}),
    ...(student.email ? { studentEmail: student.email } : {}),
    submittedAt: Date.now(),
    status: "submitted",
    answers: gradedAnswers,
    autoScore,
    manualScore: 0,
    totalScore: total,
    maxScore: max,
    percent,
  });

  const ref = await addDoc(collection(db, "attempts"), attempt);
  return ref.id;
}
