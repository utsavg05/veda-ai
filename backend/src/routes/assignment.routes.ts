import { Router } from 'express';
import {
  createAssignmentController,
  getAssignmentController,
  getAssignmentsController,
  regenerateAssignmentController,
} from '../controllers/assignment.controller.js';
import { assignmentUpload } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/', assignmentUpload.single('material'), createAssignmentController);
router.get('/', getAssignmentsController);
router.get('/:id', getAssignmentController);
router.post('/:id/regenerate', regenerateAssignmentController);

export default router;