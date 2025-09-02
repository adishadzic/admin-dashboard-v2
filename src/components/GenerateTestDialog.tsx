"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UITest, Question, QuestionType } from "@/types/test";

// --- Types for the API response (what /api/generate-test returns) ------------
interface ApiQuestion {
  id?: string; // API may or may not return ids; we don't depend on them here
  text: string;
  type: QuestionType; // "mcq" | "truefalse" | "short"
  options?: string[];
  correctAnswer: string;
  topic?: string;
  points?: number;
}
interface ApiGeneratedTest {
  id: string;                 // server assigns uuid
  title: string;
  description?: string;
  questions: ApiQuestion[];
}

// Map API -> UITest (UI expects name instead of title, points default, etc.)
function mapApiToUITest(api: ApiGeneratedTest): Omit<UITest, "createdAt" | "createdBy"> {
  const mappedQuestions: Question[] = (api.questions ?? []).map((q, idx) => ({
    id: q.id ?? `q-${idx + 1}`,
    text: q.text,
    type: q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    topic: q.topic,
    points: q.points ?? 1,
  }));

  return {
    id: api.id,
    name: api.title,
    description: api.description,
    questions: mappedQuestions,
  };
}

// --- Props -------------------------------------------------------------------
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  // Firestore save injected from the tests page:
  saveTest: (t: Omit<UITest, "id" | "createdAt" | "createdBy">) => Promise<string>;
  onSaved: (newId: string) => void;
};

export default function GenerateTestDialog({ open, onOpenChange, saveTest, onSaved }: Props) {
  const [prompt, setPrompt] = React.useState<string>("");
  const [num, setNum] = React.useState<number>(10);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, numQuestions: num }),
      });

      const json = (await res.json()) as ApiGeneratedTest | { error?: string };
      if (!res.ok) {
        const msg = "error" in json && json.error ? json.error : "Neuspješno generiranje";
        throw new Error(msg);
      }

      const ui = mapApiToUITest(json as ApiGeneratedTest);

      // Do not save fields managed by Firestore (id/createdAt/createdBy):
      const payload: Omit<UITest, "id" | "createdAt" | "createdBy"> = {
        name: ui.name,
        description: ui.description,
        questions: ui.questions,
        startDate: ui.startDate,
        duration: ui.duration,
      };

      const newId = await saveTest(payload);
      onSaved(newId);

      onOpenChange(false);
      setPrompt("");
      setNum(10);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Greška";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generiraj test (AI)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tema / upute</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="npr. Osnove OOP-a. 2 MCQ, 1 true/false, 1 short. Na hrvatskom."
              required
              className="min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Broj pitanja</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={Number.isFinite(num) ? num : 1}
              onChange={(e) => setNum(Math.max(1, Math.min(50, parseInt(e.target.value || "1", 10))))}
              className="w-32"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Generiram..." : "Generiraj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
