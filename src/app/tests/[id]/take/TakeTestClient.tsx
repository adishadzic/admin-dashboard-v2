"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getTestById } from "@/lib/testsRepo";
import type { UITest, Question } from "@/types/test";
import { submitAttempt, AttemptAnswer } from "@/lib/attemptsRepo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type Props = { id: string };

type AnswerState = Record<string, string>;

export default function TakeTestClient({ id }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [test, setTest] = React.useState<UITest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [error, setError] = React.useState<string>("");

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
      if (mounted) {
        setTest(t);
        setLoading(false);
        const init: AnswerState = {};
        for (const q of t?.questions ?? []) init[String(q.id)] = "";
        setAnswers(init);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  function updateAnswer(q: Question, value: string) {
    setAnswers((prev) => ({ ...prev, [String(q.id)]: value }));
  }

  async function handleSubmit() {
    if (!user || !test) return;
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

      router.replace(`/attempts/${attemptId}`);
    } catch (e) {
        console.log(e);
        
      setError("Greška pri predaji. Pokušaj ponovno.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <div className="p-6 text-gray-600">Učitavam…</div>;
  if (!test) return <div className="p-6">Test nije pronađen.</div>;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">{test.name}</h1>
      {test.description && <p className="text-gray-600 mb-6">{test.description}</p>}

      <ol className="list-decimal pl-5 space-y-6">
        {(test.questions ?? []).map((q) => (
          <li key={String(q.id)}>
            <div className="font-medium">{q.text}</div>
            <div className="text-xs text-gray-500 uppercase mb-2">
              {q.type} · {q.points ?? 1} bod(ova){q.topic ? ` · ${q.topic}` : ""}
            </div>

            {q.type === "mcq" && q.options?.length ? (
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const id = `q-${q.id}-opt-${idx}`;
                  return (
                    <label key={id} htmlFor={id} className="flex items-center gap-2">
                      <input
                        id={id}
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[String(q.id)] === opt}
                        onChange={() => updateAnswer(q, opt)}
                        className="h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "truefalse" ? (
              <div className="space-y-2">
                {["True", "False"].map((opt) => {
                  const id = `q-${q.id}-${opt}`;
                  return (
                    <label key={id} htmlFor={id} className="flex items-center gap-2">
                      <input
                        id={id}
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[String(q.id)] === opt}
                        onChange={() => updateAnswer(q, opt)}
                        className="h-4 w-4"
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
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Predajem…" : "Predaj test"}
        </Button>
      </div>
    </div>
  );
}
