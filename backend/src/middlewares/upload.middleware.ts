import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      if (error) {
        callback(error, uploadDirectory);
        return;
      }

      callback(null, uploadDirectory);
    });
  },
  filename: (_req, file, callback) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;
    callback(null, fileName);
  },
});

export const assignmentUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});