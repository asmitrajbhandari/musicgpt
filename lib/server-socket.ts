import { io } from 'socket.io-client';

export const emitToSocket = async (event: string, data: any) => {
  const socketUrl = 'http://127.0.0.1:3001'; 
  
  return new Promise((resolve, reject) => {
    console.log(`Connecting via WebSocket to ${socketUrl}...`);
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log(`Connected: ${socket.id}`);
      
      setTimeout(() => {
        socket.emit(event, data, (ack: any) => {
          console.log('Server acknowledged event!');
          socket.disconnect();
          resolve(ack);
        });
      }, 50);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      socket.close();
      reject(err);
    });

    setTimeout(() => {
      if (socket.connected) {
        socket.disconnect();
        reject(new Error('Emit Timeout'));
      }
    }, 4500);
  });
};