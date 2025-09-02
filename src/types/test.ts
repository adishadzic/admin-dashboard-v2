export type QuestionType = "mcq" | "truefalse" | "short";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  topic?: string;
  points: number;
}

export interface UITest {
  id: string;
  name: string;
  startDate?: string;
  duration?: string;
  description?: string;
  questions?: Question[];
  createdBy?: string;
  createdAt?: number;
}
