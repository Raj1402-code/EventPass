const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { initDB } = require('./config/db');
const { authenticateToken, requireRole } = require('./middleware/auth');
const authController = require('./controllers/authController');
const eventController = require('./controllers/eventController');
const checkInController = require('./controllers/checkInController');
const aiController = require('./controllers/aiController');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

// Socket.io Connection Room Handler
io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);

  socket.on('join_event_room', (eventId) => {
    const room = `event_${eventId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('leave_event_room', (eventId) => {
    const room = `event_${eventId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/send-otp', authController.sendOtp);
app.get('/api/auth/me', authenticateToken, authController.getMe);

// Event Routes
app.post('/api/events', authenticateToken, requireRole('organizer'), eventController.createEvent);
app.get('/api/events', authenticateToken, eventController.getEvents);
app.get('/api/events/my/registrations', authenticateToken, eventController.getMyRegistrations);
app.get('/api/events/:id', authenticateToken, eventController.getEventById);
app.post('/api/events/register', authenticateToken, eventController.registerForEvent);
app.get('/api/events/:id/export', authenticateToken, requireRole('organizer'), eventController.exportCSV);

// Check-In Routes
app.post('/api/checkin', authenticateToken, requireRole('organizer'), checkInController.performCheckIn);
app.post('/api/checkin/sync-offline', authenticateToken, requireRole('organizer'), checkInController.syncOfflineScans);

// AI Insights Route
app.post('/api/events/ai-query', authenticateToken, requireRole('organizer'), aiController.getAiInsights);

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 5001;

async function startServer() {
  await initDB();
  server.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start backend server:', err);
});

module.exports = app;
