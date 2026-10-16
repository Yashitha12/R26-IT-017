import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes';

dotenv.config();

const app: Application = express();

// Middleware with 25MB body limit for real-time photo & document uploads
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static frontend
app.use(express.static(path.join(process.cwd(), 'public')));

// API Routes
app.use('/api', apiRoutes);

// Fallback to index.html for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

export default app;
