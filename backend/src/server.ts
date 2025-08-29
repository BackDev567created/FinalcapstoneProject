import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join order room for real-time updates
  socket.on('join-order', (orderId: string) => {
    socket.join(`order-${orderId}`);
    console.log(`User ${socket.id} joined order ${orderId}`);
  });

  // Join product updates room
  socket.on('join-products', () => {
    socket.join('products');
    console.log(`User ${socket.id} joined products room`);
  });

  // Join chat room
  socket.on('join-chat', (orderId: string) => {
    socket.join(`chat-${orderId}`);
    console.log(`User ${socket.id} joined chat ${orderId}`);
  });

  // Handle location updates
  socket.on('location-update', (data) => {
    const { orderId, latitude, longitude } = data;
    io.to(`order-${orderId}`).emit('location-updated', {
      orderId,
      latitude,
      longitude,
      timestamp: new Date()
    });
  });

  // Handle stock alerts
  socket.on('stock-alert', (data) => {
    io.to('products').emit('stock-alert-triggered', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export { io };