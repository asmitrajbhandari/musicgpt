const { createServer } = require('http');
const { Server } = require('socket.io');

// Create a simple HTTP server for Socket.IO only
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] 
});

io.on('connection', (socket) => {
  console.log(`[${socket.id}] New Connection via ${socket.conn.transport.name}`);

  socket.on('disconnect', (reason) => {
    console.log(`[${socket.id}] Disconnected: ${reason}`);
  });
  
  // Listen for song-progress events from backend and broadcast to all clients
  socket.on('song-progress', (data) => {
    console.log('Received song-progress from backend:', data);
    // Broadcast to all connected clients (including the frontend)
    io.emit('song-progress', data);
  });
});

httpServer.listen(3001, '0.0.0.0', () => {
  console.log('Socket.IO server listening on port 3001');
  console.log('Ready to receive song-progress events from musicgpt-be');
});