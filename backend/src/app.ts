import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import assignmentRoutes from './routes/assignment.routes.js';
import pdfRoutes from './routes/pdf.routes.js';

const app = express();

app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	}),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
	res.json({
		success: true,
		message: 'Backend is healthy',
		data: {
			status: 'ok',
		},
	});
});

app.use('/api/assignments', assignmentRoutes);
app.use('/api/pdf', pdfRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
