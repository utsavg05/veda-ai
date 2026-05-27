import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { enqueueAssignmentGeneration } from '../queues/assignment.queue.js';
import { emitAssignmentUpdate } from '../sockets/socket.js';
import { generateAssessment } from '../services/ai.service.js';
import {
  attachResultToAssignment,
  createAssignmentRecord,
  getAssignmentById,
  getAssignments,
  markAssignmentFailed,
  markAssignmentProcessing,
  queueAssignmentAgain,
  saveGeneratedResult,
  updateAssignmentStatus,
} from '../services/assignment.service.js';
import type { AssignmentInput, QuestionTypeInput } from '../types/assignment.types.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const readString = (value: unknown, fieldName: string, required = true): string | undefined => {
  if (typeof value !== 'string') {
    if (required) {
      throw new ApiError(400, `${fieldName} is required`);
    }

    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue && required) {
    throw new ApiError(400, `${fieldName} is required`);
  }

  return trimmedValue || undefined;
};

const parseDueDate = (value: unknown): Date => {
  const rawValue = readString(value, 'dueDate');

  if (!rawValue) {
    throw new ApiError(400, 'dueDate is required');
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'dueDate must be a valid date');
  }

  return parsedDate;
};

const parsePositiveInteger = (value: unknown, fieldName: string): number => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }

  return parsedValue;
};

const parseQuestionTypes = (value: unknown): QuestionTypeInput[] => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'questionTypes must not be empty');
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(value);
  } catch {
    throw new ApiError(400, 'questionTypes must be valid JSON');
  }

  if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
    throw new ApiError(400, 'questionTypes must not be empty');
  }

  return parsedValue.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new ApiError(400, `questionTypes[${index}] must be an object`);
    }

    const typedItem = item as Record<string, unknown>;
    const type = readString(typedItem.type, `questionTypes[${index}].type`);
    const count = parsePositiveInteger(typedItem.count, `questionTypes[${index}].count`);
    const marks = parsePositiveInteger(typedItem.marks, `questionTypes[${index}].marks`);

    if (!type) {
      throw new ApiError(400, `questionTypes[${index}].type is required`);
    }

    return {
      type,
      count,
      marks,
    };
  });
};

const buildAssignmentInput = (req: Request): AssignmentInput => {
  const title = readString(req.body.title, 'title');
  const subject = readString(req.body.subject, 'subject');
  const className = readString(req.body.className, 'className');
  const dueDate = parseDueDate(req.body.dueDate);
  const instructions = readString(req.body.instructions, 'instructions', false);
  const questionTypes = parseQuestionTypes(req.body.questionTypes);

  if (!title || !subject || !className) {
    throw new ApiError(400, 'title, subject, and className are required');
  }

  const material = req.file
    ? {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      }
    : undefined;

  return {
    title,
    subject,
    className,
    dueDate,
    instructions,
    questionTypes,
    material,
  };
};

const emitStatusUpdate = async (eventName: string, assignmentId: string, payload: Record<string, unknown>): Promise<void> => {
  await emitAssignmentUpdate(eventName, {
    assignmentId,
    ...payload,
  });
};

export const createAssignmentController = asyncHandler(async (req: Request, res: Response) => {
  const input = buildAssignmentInput(req);
  const assignment = await createAssignmentRecord(input);

  try {
    await enqueueAssignmentGeneration(String(assignment._id));
    await emitStatusUpdate('assignment:queued', String(assignment._id), {
      assignment,
      status: 'queued',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to queue assignment';
    await updateAssignmentStatus(String(assignment._id), 'failed', { error: message });
    throw error instanceof ApiError ? error : new ApiError(500, message);
  }

  return res.status(201).json({
    success: true,
    message: 'Assignment queued successfully',
    data: {
      assignmentId: assignment._id,
      status: assignment.status,
    },
  });
});

export const getAssignmentsController = asyncHandler(async (_req: Request, res: Response) => {
  const assignments = await getAssignments();

  return res.json({
    success: true,
    message: 'Assignments fetched successfully',
    data: assignments,
  });
});

export const getAssignmentController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid assignment id');
  }

  const assignment = await getAssignmentById(id);

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  return res.json({
    success: true,
    message: 'Assignment fetched successfully',
    data: assignment,
  });
});

export const regenerateAssignmentController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid assignment id');
  }

  const assignment = await queueAssignmentAgain(id);

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  await enqueueAssignmentGeneration(id);
  await emitStatusUpdate('assignment:queued', id, {
    assignment,
    status: 'queued',
  });

  return res.json({
    success: true,
    message: 'Assignment queued for regeneration',
    data: assignment,
  });
});

export const processAssignmentJob = async (assignmentId: string): Promise<void> => {
  const assignment = await getAssignmentById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  await markAssignmentProcessing(assignmentId);
  await emitStatusUpdate('assignment:processing', assignmentId, {
    status: 'processing',
  });

  const generatedResult = await generateAssessment(assignment);
  const result = await saveGeneratedResult(generatedResult);
  const updatedAssignment = await attachResultToAssignment(assignmentId, result._id);

  await emitStatusUpdate('assignment:completed', assignmentId, {
    assignment: updatedAssignment,
    result,
    status: 'completed',
  });
};

export const failAssignmentJob = async (assignmentId: string, errorMessage: string): Promise<void> => {
  const updatedAssignment = await markAssignmentFailed(assignmentId, errorMessage);

  await emitStatusUpdate('assignment:failed', assignmentId, {
    assignment: updatedAssignment,
    error: errorMessage,
    status: 'failed',
  });
};