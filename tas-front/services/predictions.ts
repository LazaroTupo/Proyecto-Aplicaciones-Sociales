import { api } from './api';

export interface PredictionResult {
  successProbability: number;
  feasibilityIndex: number;
  transparencyIndex: number;
  recommendations: string[];
}

export const evaluateProject = async (projectId: string): Promise<PredictionResult> => {
  const { data } = await api.post<PredictionResult>(`/predictions/projects/${projectId}/evaluate`);
  return data;
};
