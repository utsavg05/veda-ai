import type { Request, Response } from 'express';
import { getPdfPlaceholderResponse } from '../services/pdf.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPdfPlaceholderController = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;

  return res.json({
    success: true,
    message: 'PDF placeholder response',
    data: getPdfPlaceholderResponse(assignmentId),
  });
});