import { Router } from 'express';
import { getPdfPlaceholderController } from '../controllers/pdf.controller';

const router = Router();

router.get('/:assignmentId', getPdfPlaceholderController);

export default router;