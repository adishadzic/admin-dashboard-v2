import OpenAI from "openai";

const SYSTEM_INSTRUCTIONS = [
  "You are an exam generator.",
  "Return ONLY valid JSON, no prose, no markdown.",
  `Schema:{
    "title": "string",
    "description": "string (optional)",
    "questions": [{
      "text": "string",
      "type": "mcq|truefalse|short",
      "options": ["string"] (for mcq),
      "correctAnswer": "string",
      "topic": "string (optional)",
      "points": number
    }]
  }`,
  "- For 'mcq' provide exactly 4 plausible options.",
  "- 'truefalse' uses 'True' or 'False' as correctAnswer.",
  "- Use the requested number of questions.",
].join("\n");

function userPrompt(prompt: string, numQuestions: number, mix?: string[]) {
  const lines = [
    `Topic/Prompt: ${prompt}`,
    `Number of questions: ${numQuestions}`,
    mix?.length ? `Question types to include: ${mix.join(", ")}` : "",
    "Language: Croatian.",
  ].filter(Boolean);
  return lines.join("\n");
}

type GenerateParams = {
  prompt: string;
  numQuestions?: number;
  mix?: Array<"mcq" | "truefalse" | "short">;
};

export async function generateTestAI({ prompt, numQuestions = 10, mix }: GenerateParams) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      { role: "user", content: userPrompt(prompt, numQuestions, mix) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}
