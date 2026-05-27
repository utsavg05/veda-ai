import type { Request, Response } from 'express';
import { getPdfPlaceholderResponse } from '../services/pdf.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getPdfPlaceholderController = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;

  if (typeof assignmentId !== 'string') {
    throw new ApiError(400, 'Invalid assignment id');
  }

  res.json({
    success: true,
    message: 'PDF placeholder response',
    data: getPdfPlaceholderResponse(assignmentId),
  });
});