import { useState, useCallback } from 'react';
import { evaluateProject, PredictionResult } from '../services/predictions';
import { toast } from 'sonner';

export const usePredictions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const evaluate = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateProject(projectId);
      setResult(data);
      return data;
    } catch (err: any) {
      // 503 and 403 are handled by axios interceptor and toast
      const message = err.response?.data?.message || 'Error al evaluar el proyecto';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    evaluate,
  };
};
