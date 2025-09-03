import { NextResponse } from "next/server";
import { inboundTestSchema } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";
import { generateTestAI } from "@/lib/aiClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  prompt: string;
  numQuestions?: number;
  mix?: Array<"mcq" | "truefalse" | "short">;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, numQuestions = 10, mix } = (await req.json()) as Body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const raw = await generateTestAI({ prompt, numQuestions, mix });

    const safe = inboundTestSchema.parse(raw);

    const testId = uuidv4();
    const withIds = {
      id: testId,
      title: safe.title,
      description: safe.description,
      questions: safe.questions.map((q) => ({
        id: uuidv4(),
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        points: q.points ?? 1,
      })),
    };

    return NextResponse.json(withIds, { status: 200 });
  } catch (err: unknown) {
    console.error("generate-test error:", err);
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
