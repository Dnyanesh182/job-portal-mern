import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

/**
 * =========================
 * CORS CONFIGURATION (FIXED)
 * =========================
 * Allows:
 * - Local development (localhost:5173)
 * - Production frontend (Vercel)
 */
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // Vercel URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server & Postman requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ================= API ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Job Portal API is running 🚀',
  });
});

// ================= ERROR HANDLER =================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.message);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ================= 404 HANDLER =================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at /api`);
});

export default app;
