import { Types } from 'mongoose';
import { Assignment, type AssignmentDocument } from '../models/assignment.model.js';
import { GeneratedResult, type GeneratedResultDocument } from '../models/result.model.js';
import type { AssignmentInput, GeneratedResultPayload } from '../types/assignment.types.js';

const assignmentResultPopulate = 'result';

export const createAssignmentRecord = async (input: AssignmentInput): Promise<AssignmentDocument> => {
  return Assignment.create({
    ...input,
    status: 'queued',
  });
};

export const getAssignments = async (): Promise<AssignmentDocument[]> => {
  return Assignment.find()
    .sort({ createdAt: -1 })
    .populate({
      path: assignmentResultPopulate,
      select: 'subject className totalMarks sections createdAt updatedAt',
    })
    .exec();
};

export const getAssignmentById = async (assignmentId: string): Promise<AssignmentDocument | null> => {
  return Assignment.findById(assignmentId)
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};

export const updateAssignmentStatus = async (
  assignmentId: string,
  status: AssignmentDocument['status'],
  updates: Partial<Pick<AssignmentDocument, 'error' | 'result'>> = {},
): Promise<AssignmentDocument | null> => {
  const updatePayload: Record<string, unknown> = { status };

  if (typeof updates.error === 'string') {
    updatePayload.error = updates.error;
  }

  if (updates.result) {
    updatePayload.result = updates.result;
  }

  return Assignment.findByIdAndUpdate(assignmentId, updatePayload, { new: true })
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};

export const queueAssignmentAgain = async (assignmentId: string): Promise<AssignmentDocument | null> => {
  return Assignment.findByIdAndUpdate(
    assignmentId,
    {
      status: 'queued',
      $unset: { error: 1 },
    },
    { new: true },
  )
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};

export const markAssignmentProcessing = async (assignmentId: string): Promise<AssignmentDocument | null> => {
  return Assignment.findByIdAndUpdate(
    assignmentId,
    {
      status: 'processing',
      $unset: { error: 1 },
    },
    { new: true },
  )
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};

export const markAssignmentFailed = async (
  assignmentId: string,
  errorMessage: string,
): Promise<AssignmentDocument | null> => {
  return Assignment.findByIdAndUpdate(
    assignmentId,
    {
      status: 'failed',
      error: errorMessage,
    },
    { new: true },
  )
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};

export const saveGeneratedResult = async (
  resultData: GeneratedResultPayload,
): Promise<GeneratedResultDocument> => {
  return GeneratedResult.create(resultData);
};

export const attachResultToAssignment = async (
  assignmentId: string,
  resultId: Types.ObjectId,
): Promise<AssignmentDocument | null> => {
  return Assignment.findByIdAndUpdate(
    assignmentId,
    {
      status: 'completed',
      result: resultId,
      $unset: { error: 1 },
    },
    { new: true },
  )
    .populate({
      path: assignmentResultPopulate,
    })
    .exec();
};