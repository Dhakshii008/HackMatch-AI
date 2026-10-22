import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const notifs = res.data.data || [];
      set({ 
        notifications: notifs, 
        unreadCount: notifs.filter(n => !n.isRead).length 
      });
    } catch (err) { 
      /* silent fail */ 
    }
  },
  
  markRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => n._id === id ? {...n, isRead: true} : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {}
  },
  
  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({...n, isRead: true})),
        unreadCount: 0
      }));
    } catch (err) {}
  },
  
  addNotification: (notif) => {
    set(state => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));

export default useNotificationStore;
