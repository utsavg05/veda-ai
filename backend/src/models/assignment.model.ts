import { Schema, model, type Document, type Types } from 'mongoose';
import type {
  AssignmentInput,
  AssignmentStatus,
  MaterialMetadata,
  QuestionTypeInput,
} from '../types/assignment.types';

export interface AssignmentDocument extends Document, AssignmentInput {
  status: AssignmentStatus;
  error?: string;
  result?: Types.ObjectId;
}

const questionTypeSchema = new Schema<QuestionTypeInput>(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      required: true,
      min: 1,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const materialSchema = new Schema<MaterialMetadata>(
  {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    title: {
      type: String,
      required: true,
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
    dueDate: {
      type: Date,
      required: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    questionTypes: {
      type: [questionTypeSchema],
      required: true,
      validate: {
        validator: (value: QuestionTypeInput[]) => value.length > 0,
        message: 'questionTypes must not be empty',
      },
    },
    material: {
      type: materialSchema,
      required: false,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      required: true,
    },
    error: {
      type: String,
      trim: true,
    },
    result: {
      type: Schema.Types.ObjectId,
      ref: 'GeneratedResult',
    },
  },
  {
    timestamps: true,
  },
);

export const Assignment = model<AssignmentDocument>('Assignment', assignmentSchema);