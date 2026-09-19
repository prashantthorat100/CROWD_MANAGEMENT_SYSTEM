import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vari_smart_ops';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Global MongoDB connection state tracker
let isDbConnected = false;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${MONGO_URI}`);
  })
  .catch((err) => {
    isDbConnected = false;
    console.error(`[Database Error] MongoDB connection failure: ${err.message}`);
  });

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('[Database] MongoDB reconnected');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.emit('system:info', {
    message: 'Connected to Vari Smart Operations real-time gateway',
    timestamp: new Date().toISOString(),
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Pass io to routes if needed
app.set('io', io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vari-smart-ops-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      readyState: mongoose.connection.readyState, // 1 = connected
      uri: MONGO_URI.replace(/\/\/.*@/, '//***@'), // hide auth if present
    },
    aiServiceUrl: AI_SERVICE_URL,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Hello world root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Vari Smart Operations Platform API',
    motto: 'SENSE -> PREDICT -> OPTIMIZE -> ACT',
    version: '1.0.0',
    documentation: '/api/docs',
    healthCheck: '/api/health',
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.url} does not exist.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`[Backend Server] Vari Smart Operations backend listening on http://localhost:${PORT}`);
  console.log(`[Backend Server] Health check available at http://localhost:${PORT}/api/health`);
});
