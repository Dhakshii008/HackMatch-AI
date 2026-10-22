const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images
app.use(morgan('dev'));

// Uploads directory
app.use('/uploads', express.static('uploads'));

// Health check (used by the deploy platform)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

// Routes (to be mounted)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/collaboration', require('./routes/collaboration'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/judge', require('./routes/judge'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins personal room for notifications
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });

  // User joins team room
  socket.on('join_team', (teamId) => {
    socket.join(`team_${teamId}`);
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(`team_${teamId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically ensure all 15 demo accounts, problem statements, and roles exist
    const { seedDemoUsers } = require('./seed/seedDemoUsers');
    await seedDemoUsers({ reset: false });
    console.log('✓ Ensured all 15 demo accounts exist and are ready for login.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Retry connection after 5s
    setTimeout(connectDB, 5000);
  }
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await connectDB();
});
