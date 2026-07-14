import { api } from './api';

export interface Notification {
  id: string | number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export const getNotifications = async (page = 1, limit = 20): Promise<PaginatedNotifications> => {
  const { data } = await api.get<PaginatedNotifications>('/notifications', { params: { page, limit } });
  return data;
};

export const markNotificationAsRead = async (id: number | string): Promise<Notification> => {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.patch<{ success: boolean; message: string }>('/notifications/read-all');
  return data;
};
