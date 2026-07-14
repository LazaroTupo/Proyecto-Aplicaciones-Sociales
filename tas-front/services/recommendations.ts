import { api } from './api';
import { Project } from './projects';

export interface GetFeedParams {
  page?: number;
  limit?: number;
}

export interface InteractionPayload {
  projectId: string;
  interactionType: 'view' | 'like' | 'pledge';
}

export const recommendationsService = {
  getFeed: async (params?: GetFeedParams): Promise<Project[]> => {
    const { data } = await api.get('/recommendations/feed', { params });
    return data;
  },

  interact: async (payload: InteractionPayload): Promise<any> => {
    const { data } = await api.post('/recommendations/interact', payload);
    return data;
  }
};
