import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<typeof mongoose> => {
	if (mongoose.connection.readyState === 1) {
		return mongoose;
	}

	await mongoose.connect(env.MONGO_URI);
	return mongoose;
};
