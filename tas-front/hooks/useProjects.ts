import { useState, useCallback } from 'react';
import { projectsService, GetProjectsParams, Project, ProjectsResponse, ProjectStats } from '../services/projects';

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (params?: GetProjectsParams): Promise<ProjectsResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectsService.getProjects(params);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching projects');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectsService.getProjectById(id);
      return project;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching project');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (formData: FormData): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectsService.createProject(formData);
      return project;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, formData: FormData): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectsService.updateProject(id, formData);
      return project;
    } catch (err: any) {
      console.error('Update Project Error Data:', err.response?.data);
      setError(
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : err.response?.data?.message || err.message || 'Error updating project'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectStats = useCallback(async (): Promise<ProjectStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const stats = await projectsService.getProjectStats();
      return stats;
    } catch (err: any) {
      console.error('Get Project Stats Error Data:', err.response?.data);
      setError('Error obteniendo estadísticas de proyectos'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await projectsService.deleteProject(id);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error deleting project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats
  };
};
