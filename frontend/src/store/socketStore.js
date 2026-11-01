import { create } from 'zustand';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/';
  return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '') || '/';
};

const useSocketStore = create((set, get) => ({
  socket: null,
  
  connect: (userId) => {
    if (get().socket) return;
    // Same-origin by default so the Vite dev proxy handles it; VITE_API_URL
    // points Socket.IO at the deployed backend in production.
    const newSocket = io(getSocketUrl(), { query: { userId } });
    newSocket.on('connect', () => {
      // Join the personal room so notifications and accept/reject events arrive.
      if (userId) newSocket.emit('join_user', userId);
    });
    set({ socket: newSocket });
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
  
  joinTeamRoom: (teamId) => {
    const { socket } = get();
    if (socket && teamId) {
      // Event name must match the server handler in server.js ('join_team').
      socket.emit('join_team', teamId);
    }
  },
  
  leaveTeamRoom: (teamId) => {
    const { socket } = get();
    if (socket && teamId) {
      socket.emit('leave_team', teamId);
    }
  }
}));

export default useSocketStore;
