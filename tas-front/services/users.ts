import { api } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'creator' | 'backer' | 'admin';
  isVerified: boolean;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: 'creator' | 'backer';
  createdAt: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

export const usersService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  updateMe: async (payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put<User>('/users/me', payload);
    return data;
  },

  getPublicProfile: async (id: string): Promise<PublicUser> => {
    const { data } = await api.get<PublicUser>(`/users/${id}`);
    return data;
  }
};
