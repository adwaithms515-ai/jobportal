const socketIO = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join a room based on User ID
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const sendRealtimeNotification = (recipientId, notificationData) => {
  if (io) {
    io.to(recipientId.toString()).emit('notification', notificationData);
    console.log(`Real-time notification emitted to user ${recipientId}`);
  }
};

const broadcastNotification = (notificationData) => {
  if (io) {
    io.emit('broadcast', notificationData);
    console.log('Real-time broadcast notification emitted');
  }
};

module.exports = {
  initSocket,
  sendRealtimeNotification,
  broadcastNotification,
  getIo: () => io
};
