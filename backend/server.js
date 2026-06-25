import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import damagedStockRoutes from './routes/damagedStockRoutes.js';
import returnRequestRoutes from './routes/returnRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { expiryMonitorJob } from './cron/expiryMonitor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const defaultCorsOrigins = [
  'http://localhost:5173',
  'https://mediwave-project.vercel.app'
];
const allowedOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const isAllowedVercelOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

connectDB();

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        isAllowedVercelOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.json({
    name: 'MediWave API',
    status: 'running',
    health: '/api/health'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/medicines', authMiddleware, medicineRoutes);
app.use('/api/damaged-stock', authMiddleware, damagedStockRoutes);
app.use('/api/returns', authMiddleware, returnRequestRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/audit', authMiddleware, auditLogRoutes);
app.use('/api/audit-logs', authMiddleware, auditLogRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

app.use(errorHandler);

expiryMonitorJob();

app.listen(PORT, () => {
  console.log(`MediWave backend running on port ${PORT}`);
});
