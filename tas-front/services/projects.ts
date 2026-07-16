import { api } from './api';

export interface ProjectReward {
  id?: string;
  amount: number;
  description: string;
}

export interface ProjectCreator {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount?: number;
  durationDays?: number;
  trlLevel?: number;
  category: string;
  status: 'draft' | 'review' | 'funding' | 'funded' | 'closed';
  aiSuccessProbability?: number;
  aiFeasibilityIndex?: number;
  aiRecommendations?: string[];
  documentUrls?: string[];
  creator?: ProjectCreator;
  rewards?: ProjectReward[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectStats {
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byAiSuccessProbability: { range: string; count: number }[];
}

export interface ProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  lastPage: number;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  creatorId?: string;
  filter?: string;
}

export const projectsService = {
  getProjects: async (params?: GetProjectsParams): Promise<ProjectsResponse> => {
    const { data } = await api.get('/projects', { params });
    return data;
  },

  getProjectStats: async (): Promise<ProjectStats> => {
    const { data } = await api.get('/projects/stats');
    return data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  createProject: async (formData: FormData): Promise<Project> => {
    const { data } = await api.post('/projects', formData);
    return data;
  },

  updateProject: async (id: string, formData: FormData): Promise<Project> => {
    const { data } = await api.put(`/projects/${id}`, formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    return data;
  },

  deleteProjectFile: async (projectId: string, fileName: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/files/${fileName}`);
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  updateProjectStatus: async (id: string, status: string): Promise<Project> => {
    const { data } = await api.patch(`/projects/${id}/status`, { status });
    return data;
  }
};
