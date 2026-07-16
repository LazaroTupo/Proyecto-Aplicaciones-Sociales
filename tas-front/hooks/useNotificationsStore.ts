import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Notification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  isConnected: boolean;
  emitProjectView: (data: {
    projectId: string;
    ownerId: string;
    title: string;
  }) => void;
  initializeSocket: () => void;
  disconnectSocket: () => void;
  fetchNotifications: (retryCount?: number) => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  isConnected: false,

  initializeSocket: () => {
    const token = Cookies.get('accessToken');
    if (!token) return;

    if (get().socket) return;

    const API_URL = 'http://213.210.20.7:3002';
    const socket = io(`${API_URL}/ws/notifications`, {
      auth: { token },
      query: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('CONECTADO');

      set({ isConnected: true });
    });

    socket.on('project_viewed', (payload: any) => {

      toast.info(
        payload?.message || 'Hay alguien viendo tu proyecto',
        {
          action: {
            label: 'Ver',
            onClick: () => {
              console.log('Ver proyecto', payload?.projectId);
              window.location.href = `/projects/${payload.projectId}`;
            },
          },
        }
      );

      get().fetchNotifications();
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('new_pledge_received', (payload: any) => {
      toast.success(payload?.message || '¡Has recibido un nuevo aporte en tu proyecto!');
      get().fetchNotifications();
    });

    socket.on('project_status_changed', (payload: any) => {
      toast.info(payload?.message || 'Un proyecto ha cambiado de estado.');
      get().fetchNotifications();
    });

    // Generic notifications
    socket.on('notification', (payload: any) => {
      toast(payload?.message || 'Nueva notificación recibida');
      get().fetchNotifications();
    });

    set({ socket });
  },

  emitProjectView: (data: {
    projectId: string;
    ownerId: string;
    title: string;
  }) => {
    const socket = get().socket;

    if (socket) {
      socket.emit('project_view', data);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  fetchNotifications: async (retryCount = 0) => {
    try {
      const response = await getNotifications(1, 20);
      set({
        notifications: response.data,
        unreadCount: response.data.filter(n => !n.isRead).length
      });
    } catch (error) {
      if (retryCount < 10) {
        const delay = 3000 * Math.pow(1.5, retryCount);
        console.warn(`Error fetching notifications, reintentando en ${Math.round(delay / 1000)}s...`);
        setTimeout(() => {
          get().fetchNotifications(retryCount + 1);
        }, delay);
      } else {
        console.error('Error fetching notifications tras varios intentos:', error);
      }
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));

    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      get().fetchNotifications();
    }
  }
}));
