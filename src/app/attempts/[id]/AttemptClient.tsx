"use client";

import * as React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { AttemptDoc } from "@/lib/attemptsRepo";
import type { UITest, Question } from "@/types/test";
import { getTestById } from "@/lib/testsRepo";

export default function AttemptClient({ id }: { id: string }) {
  const [attempt, setAttempt] = React.useState<(AttemptDoc & { id: string }) | null>(null);
  const [test, setTest] = React.useState<UITest | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const snap = await getDoc(doc(db, "attempts", id));
      if (!mounted) return;

      if (!snap.exists()) {
        setAttempt(null);
        setLoading(false);
        return;
      }

      const att = { id: snap.id, ...(snap.data() as AttemptDoc) };
      setAttempt(att);

      const t = await getTestById(att.testId);
      if (!mounted) return;
      setTest(t);

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-600">Učitavam…</div>;
  if (!attempt) return <div className="p-6">Pokušaj nije pronađen.</div>;

  const qById = new Map<string, Question>();
  for (const q of test?.questions ?? []) qById.set(String(q.id), q);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Rezultat</h1>
      <p className="text-gray-700">
        Ukupno: <strong>{attempt.totalScore}/{attempt.maxScore}</strong>{" "}
        (<strong>{attempt.percent}%</strong>)
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Predano: {new Date(attempt.submittedAt).toLocaleString()}
      </p>

      {test ? (
        <p className="text-sm text-gray-500 mt-1">
          Test: <strong>{test.name}</strong>
        </p>
      ) : null}

      <div className="mt-6">
        <h2 className="font-semibold mb-3">Odgovori</h2>
        <ol className="space-y-4 list-decimal pl-5">
          {attempt.answers.map((a) => {
            const q = qById.get(String(a.questionId));
            const title = q?.text ?? `Pitanje ${a.questionId}`;
            const isAutoGraded = a.isCorrect !== undefined;

            return (
              <li key={a.questionId}>
                <div className="font-medium">{title}</div>

                {q?.topic && (
                  <div className="text-xs text-gray-500">
                    Tema: {q.topic} · {q.points ?? 1} bod(ova) · {q.type}
                  </div>
                )}

                <div className="mt-1 text-sm">
                  <span className="text-gray-500">Tvoj odgovor:</span>{" "}
                  <span>{a.value || "—"}</span>
                </div>

                {isAutoGraded ? (
                  <div className="text-sm mt-1">
                    {q?.correctAnswer ? (
                      <>
                        <span className="text-gray-500">Točan odgovor:</span>{" "}
                        <span>{q.correctAnswer}</span>{" "}
                      </>
                    ) : null}
                    <span className={a.isCorrect ? "text-green-600" : "text-red-600"}>
                      {a.isCorrect ? " (točno)" : " (netočno)"}
                    </span>
                    {typeof a.awardedPoints === "number" && (
                      <> — +{a.awardedPoints} bod(ova)</>
                    )}
                  </div>
                ) : (
                  typeof a.awardedPoints === "number" && a.awardedPoints > 0 ? (
                    <div className="text-sm mt-1">
                      <span className="text-gray-500">Dodijeljeni bodovi:</span>{" "}
                      +{a.awardedPoints}
                    </div>
                  ) : (
                    <div className="text-sm mt-1 text-amber-600">
                      Čeka ručno ocjenjivanje.
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
