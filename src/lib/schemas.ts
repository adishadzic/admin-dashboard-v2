// src/lib/schemas.ts
import { z } from "zod";

export const inboundQuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["mcq", "truefalse", "short"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  topic: z.string().optional(),
  points: z.number().int().positive().default(1),
});

export const inboundTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(inboundQuestionSchema).min(1),
});

export type InboundTest = z.infer<typeof inboundTestSchema>;
