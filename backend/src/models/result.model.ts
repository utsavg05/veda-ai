import { Schema, model, type Document } from 'mongoose';
import type {
  GeneratedQuestion,
  GeneratedResultPayload,
  GeneratedSection,
} from '../types/assignment.types';

export interface GeneratedResultDocument extends Document, GeneratedResultPayload {}

const questionSchema = new Schema<GeneratedQuestion>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const sectionSchema = new Schema<GeneratedSection>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    instruction: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (value: GeneratedQuestion[]) => value.length > 0,
        message: 'sections.questions must not be empty',
      },
    },
  },
  { _id: false },
);

const generatedResultSchema = new Schema<GeneratedResultDocument>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    schoolName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    sections: {
      type: [sectionSchema],
      required: true,
      validate: {
        validator: (value: GeneratedSection[]) => value.length > 0,
        message: 'sections must not be empty',
      },
    },
  },
  {
    timestamps: true,
  },
);

export const GeneratedResult = model<GeneratedResultDocument>('GeneratedResult', generatedResultSchema);