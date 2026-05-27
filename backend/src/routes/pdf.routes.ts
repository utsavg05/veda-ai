import { Router } from 'express';
import { getPdfPlaceholderController } from '../controllers/pdf.controller.js';

const router = Router();

router.get('/:assignmentId', getPdfPlaceholderController);

export default router;