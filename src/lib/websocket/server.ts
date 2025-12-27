import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-cart', (userId: string) => {
      socket.join(`cart-${userId}`);
    });

    socket.on('join-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('WebSocket not initialized');
  return io;
};

// Emit cart update
export const emitCartUpdate = (userId: string, cart: any) => {
  const io = getIO();
  io.to(`cart-${userId}`).emit('cart-updated', cart);
};

// Emit order status update
export const emitOrderUpdate = (orderId: string, order: any) => {
  const io = getIO();
  io.to(`order-${orderId}`).emit('order-updated', order);
};
