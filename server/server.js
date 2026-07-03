require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

const { initElasticsearch } = require('./config/elasticsearch');
const { initSocket } = require('./config/socket');
const { initEmailTransporter } = require('./utils/email');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const jobRoutes = require('./routes/jobRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { isMaintenanceMode, getAnnouncement } = require('./controllers/adminController');

const app = express();
const server = http.createServer(app);

// Init sockets
const io = initSocket(server);

// Connect to DB and services
connectDB();
initElasticsearch();
initEmailTransporter();

// Midlewares
const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Static Folder serving uploads (resumes & logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Maintenance check middleware
app.use((req, res, next) => {
  if (isMaintenanceMode()) {
    // Admins are exempt
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          // Check role asynchronously or simple lookup
          // To keep it sync and fast, we can attach info or decode
        }
      } catch (err) {}
    }
    
    // We will check inside adminController or return system status
    // If it's an API route that is not admin settings, block it.
    if (req.originalUrl.includes('/api/v1/admin') || req.originalUrl.includes('/api/v1/auth/login')) {
      return next();
    }
    return res.status(503).json({
      maintenance: true,
      message: 'System is currently undergoing scheduled maintenance.',
      announcement: getAnnouncement()
    });
  }
  next();
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/recruiters', recruiterRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base route for server health check
app.get('/api/v1/health', (req, res) => {
  const db = require('./config/db');
  const dbError = typeof db.getDbError === 'function' ? db.getDbError() : null;
  
  const rawUri = process.env.MONGODB_URI || '';
  const maskedUri = rawUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1******$3');

  res.json({
    status: dbError ? 'degraded' : 'healthy',
    databaseError: dbError,
    configuredUri: maskedUri,
    uptime: process.uptime(),
    announcement: getAnnouncement(),
    maintenanceMode: isMaintenanceMode()
  });
});

// Error handling middleware
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

module.exports = app;
