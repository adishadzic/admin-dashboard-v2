"use client";

import * as React from "react";
import type { UITest } from "@/types/test";
import { getTestById } from "@/lib/testsRepo";
import { Button } from "@/components/ui/button";
import { downloadTestAsDocx } from "@/lib/exportDoc";
import { Loader2, Download, Share2, Check } from "lucide-react";

export default function TestDetailClient({ id }: { id: string }) {
  const [test, setTest] = React.useState<UITest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [downloading, setDownloading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await getTestById(id);
      if (mounted) {
        setTest(t);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDownload() {
    if (!test) return;
    try {
      setDownloading(true);
      await downloadTestAsDocx(test);
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    try {
      const url = `${window.location.origin}/tests/${id}/take`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback ako clipboard API nije dostupan
      alert("Nije moguće kopirati link. Pokušaj ponovno.");
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!test) return <div className="p-6">Test not found.</div>;

  return (
    <div className="px-[30px] py-[40px]">
      {/* Header row with title on left and actions on right */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{test.name}</h1>
          {test.description && <p className="text-gray-600 mt-1">{test.description}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleShare}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Link kopiran u meduspremnik
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Podijeli link
              </>
            )}
          </Button>

          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiram…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Preuzmi .docx
              </>
            )}
          </Button>
        </div>
      </div>

      {test.questions?.length ? (
        <ol className="list-decimal pl-5 space-y-4">
          {test.questions.map((q) => (
            <li key={q.id}>
              <div className="font-medium">{q.text}</div>
              <div className="text-xs text-gray-500 uppercase">
                {q.type} · {q.points ?? 1} bod(ova){q.topic ? ` · ${q.topic}` : ""}
              </div>
              {q.type === "mcq" && q.options?.length ? (
                <ul className="list-disc pl-5 mt-1">
                  {q.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
              ) : null}
              <div className="text-sm mt-1">
                <span className="text-gray-500">Točan odgovor:</span> {q.correctAnswer}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-gray-500">Nema pitanja.</div>
      )}
    </div>
  );
}
