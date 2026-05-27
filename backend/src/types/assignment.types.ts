import type { Types } from 'mongoose';

export type AssignmentStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export interface MaterialMetadata {
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface GeneratedQuestion {
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedResultPayload {
  assignment: Types.ObjectId;
  schoolName?: string;
  subject: string;
  className: string;
  totalMarks: number;
  sections: GeneratedSection[];
}

export interface AssignmentInput {
  title: string;
  subject: string;
  className: string;
  dueDate: Date;
  instructions?: string;
  questionTypes: QuestionTypeInput[];
  material?: MaterialMetadata;
}