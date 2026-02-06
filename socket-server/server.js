const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/create-song') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log('HTTP REQUEST RECEIVED:', data.prompt);
        console.log('Item IDs:', data.itemIds);
        
        const { prompt, itemIds } = data;
        
        if (!prompt || !itemIds || !Array.isArray(itemIds) || itemIds.length !== 2) {
          console.error('Invalid data received');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
          return;
        }

        const [item1Id, item2Id] = itemIds;
        
        console.log('Starting progress simulation for items:', item1Id, item2Id);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Song creation started' }));
        
        const simulateItem1 = async () => {
          for (let progress = 1; progress <= 100; progress++) {
            const progressData = {
              id: item1Id,
              prompt: prompt,
              progress,
              status: progress === 100 ? 'completed' : 'generating',
            };
            
            io.emit('song-progress', progressData);
            
            if (progress % 10 === 0) {
              console.log(`Item1 Progress: ${progress}%`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 250));
          }
          
          const completionData = {
            id: item1Id,
            prompt: prompt,
            progress: 100,
            status: 'completed',
            result: {
              url: `https://example.com/song-${item1Id}.mp3`,
              duration: 120
            }
          };
          io.emit('song-progress', completionData);
        };
        
        const simulateItem2 = async () => {
          for (let progress = 1; progress <= 100; progress++) {
            const progressData = {
              id: item2Id,
              prompt: prompt,
              progress,
              status: progress === 100 ? 'completed' : 'generating',
            };
            
            io.emit('song-progress', progressData);
            
            if (progress % 10 === 0) {
              console.log(`Item2 Progress: ${progress}%`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 400));
          }
          
          const completionData = {
            id: item2Id,
            prompt: prompt,
            progress: 100,
            status: 'completed',
            result: {
              url: `https://example.com/song-${item2Id}.mp3`,
              duration: 120
            }
          };
          io.emit('song-progress', completionData);
        };
        
        Promise.all([simulateItem1(), simulateItem2()]).then(() => {
          console.log('Both items completed');
        });
        
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

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
});

httpServer.listen(3001, '0.0.0.0', () => {
  console.log('Socket.IO server listening on port 3001');
  console.log('HTTP endpoint: POST http://localhost:3001/create-song');
  console.log('Will broadcast song-progress events via WebSocket');
});