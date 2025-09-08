"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getTestById } from "@/lib/testsRepo";
import type { UITest, Question } from "@/types/test";
import { submitAttempt, AttemptAnswer, getLatestAttemptFor } from "@/lib/attemptsRepo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type Props = { id: string };
type AnswerState = Record<string, string>;

function computeDurationMinutes(test: UITest | null): number {
  const qs = test?.questions ?? [];
  let minutes = 0;
  for (const q of qs) {
    switch (q.type) {
      case "mcq":
        minutes += 2;
        break;
      case "truefalse":
        minutes += 1;
        break;
      case "short":
        minutes += 3;
        break;
      default:
        minutes += 2;
    }
  }
  return minutes;
}
function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TakeTestClient({ id }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [test, setTest] = React.useState<UITest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [error, setError] = React.useState<string>("");

  const [existingAttemptId, setExistingAttemptId] = React.useState<string | null>(null);
  const [checkingAttempt, setCheckingAttempt] = React.useState(true);

  const [deadline, setDeadline] = React.useState<number | null>(null);
  const [now, setNow] = React.useState<number>(Date.now());
  const autoSubmittedRef = React.useRef(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user && !user.email?.endsWith("@student.unipu.hr")) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await getTestById(id);
      if (!mounted) return;
      setTest(t);
      setLoading(false);

      const init: AnswerState = {};
      for (const q of t?.questions ?? []) init[String(q.id)] = "";
      setAnswers(init);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      setCheckingAttempt(true);
      try {
        const attempt = await getLatestAttemptFor(id, user.uid);
        if (!mounted) return;
        if (attempt) {
          setExistingAttemptId(attempt.id);
          const key = `test-deadline:${id}:${user.uid}`;
          if (typeof window !== "undefined") window.localStorage.removeItem(key);
        } else {
          setExistingAttemptId(null);
        }
      } finally {
        if (mounted) setCheckingAttempt(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, user]);

  React.useEffect(() => {
    if (!test || !user || existingAttemptId) return;
    const minutes = computeDurationMinutes(test);
    const key = `test-deadline:${id}:${user.uid}`;
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    const parsed = saved ? Number(saved) : NaN;

    let target: number;
    if (saved && !Number.isNaN(parsed) && parsed > Date.now()) {
      target = parsed;
    } else {
      target = Date.now() + minutes * 60 * 1000;
      if (typeof window !== "undefined") window.localStorage.setItem(key, String(target));
    }
    setDeadline(target);
  }, [test, id, user, existingAttemptId]);

  React.useEffect(() => {
    if (!deadline) return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [deadline]);

  // autosubmit
  React.useEffect(() => {
    if (!deadline || existingAttemptId) return;
    if (autoSubmittedRef.current) return;
    const remaining = deadline - now;
    if (remaining <= 0) {
      autoSubmittedRef.current = true;
      handleSubmit(true).finally(() => {
        const key = user ? `test-deadline:${id}:${user.uid}` : `test-deadline:${id}`;
        if (typeof window !== "undefined") window.localStorage.removeItem(key);
      });
    }
  }, [deadline, now, existingAttemptId]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (deadline && deadline > Date.now() && !submitting && !existingAttemptId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [deadline, submitting, existingAttemptId]);

  function updateAnswer(q: Question, value: string) {
    setAnswers((prev) => ({ ...prev, [String(q.id)]: value }));
  }

  async function handleSubmit(auto = false) {
    if (!user || !test || existingAttemptId) return;
    setError("");
    setSubmitting(true);
    try {
      const payload: AttemptAnswer[] = (test.questions ?? []).map((q) => ({
        questionId: String(q.id),
        value: answers[String(q.id)] ?? "",
      }));

      const attemptId = await submitAttempt({
        test,
        student: {
          uid: user.uid,
          name: user.displayName ?? undefined,
          email: user.email ?? undefined,
        },
        answers: payload,
      });

      const key = `test-deadline:${id}:${user.uid}`;
      if (typeof window !== "undefined") window.localStorage.removeItem(key);

      router.replace(`/attempts/${attemptId}${auto ? "?auto=1" : ""}`);
    } catch (e) {
      console.log(e);
      setError("Greška pri predaji. Pokušaj ponovno.");
    } finally {
      setSubmitting(false);
    }
  }

  const remainingMs = deadline ? Math.max(0, deadline - now) : 0;
  const urgent = remainingMs <= 60_000;
  const danger = remainingMs <= 10_000;

  if (authLoading || loading || checkingAttempt)
    return <div className="p-6 text-gray-600">Učitavam…</div>;
  if (!test) return <div className="p-6">Test nije pronađen.</div>;

  if (existingAttemptId) {
    return (
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">{test.name}</h1>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          Ovaj test ste već riješili. Ponovno rješavanje nije dopušteno.
        </div>
        <div className="mt-6">
          <Button onClick={() => router.replace(`/attempts/${existingAttemptId}`)}>
            Pogledaj pokušaj
          </Button>
        </div>
      </div>
    );
  }

  // ——— NORMAL VIEW ———
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{test.name}</h1>
          {test.description && <p className="text-gray-600">{test.description}</p>}
        </div>
        <div
          className={[
            "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold ring-1",
            danger
              ? "bg-red-50 text-red-700 ring-red-200 animate-pulse"
              : urgent
              ? "bg-amber-50 text-amber-700 ring-amber-200"
              : "bg-gray-100 text-gray-800 ring-gray-300",
          ].join(" ")}
          aria-live="polite"
          title="Preostalo vrijeme"
        >
          ⏳ {formatRemaining(remainingMs)}
        </div>
      </div>

      <ol className="list-decimal pl-5 space-y-6 mt-6">
        {(test.questions ?? []).map((q) => (
          <li key={String(q.id)}>
            <div className="font-medium">{q.text}</div>
            <div className="text-xs text-gray-500 uppercase mb-2">
              {q.type} · {q.points ?? 1} bod(ova){q.topic ? ` · ${q.topic}` : ""}
            </div>

            {q.type === "mcq" && q.options?.length ? (
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const oid = `q-${q.id}-opt-${idx}`;
                  return (
                    <label key={oid} htmlFor={oid} className="flex items-center gap-2">
                      <input
                        id={oid}
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[String(q.id)] === opt}
                        onChange={() => updateAnswer(q, opt)}
                        className="h-4 w-4"
                        disabled={submitting}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "truefalse" ? (
              <div className="space-y-2">
                {["True", "False"].map((opt) => {
                  const oid = `q-${q.id}-${opt}`;
                  return (
                    <label key={oid} htmlFor={oid} className="flex items-center gap-2">
                      <input
                        id={oid}
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[String(q.id)] === opt}
                        onChange={() => updateAnswer(q, opt)}
                        className="h-4 w-4"
                        disabled={submitting}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[String(q.id)] ?? ""}
                onChange={(e) => updateAnswer(q, e.target.value)}
                className="mt-1 w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Upišite odgovor…"
                disabled={submitting}
              />
            )}
          </li>
        ))}
      </ol>

      {error && <div className="text-sm text-red-600 mt-4">{error}</div>}

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
          Odustani
        </Button>
        <Button onClick={() => handleSubmit(false)} disabled={submitting}>
          {submitting ? "Predajem…" : "Predaj test"}
        </Button>
      </div>
    </div>
  );
}
