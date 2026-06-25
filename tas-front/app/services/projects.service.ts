import axios from "axios";
import api from "../lib/axios";
import { Project } from "../types/projects.types";

export const getAllProjects = async () => {
  const { data } =
    await api.get<Project[]>(
      '/projects/all',
    );

  return data;
};

export const getAllProjectsById = async () => {
  const { data } =
    await api.get<Project[]>(
      `/projects/allByUser`,
    );

  return data;
};

export const getProjectById = async (
  id: string,
  token?: string,
) => {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  return data;
};

export const analyzeProjectWithAI = async (id: string) => {
  const { data } =
    await api.post<Project>(
      `/projects/${id}/analyze`,
    );

  return data;
};