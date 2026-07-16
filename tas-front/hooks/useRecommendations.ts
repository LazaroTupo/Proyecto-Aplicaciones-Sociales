import { useState, useCallback } from 'react';
import { recommendationsService } from '../services/recommendations';
import { Project } from '../services/projects';

export const useRecommendationsFeed = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      setError(null);
      // For infinite scroll, limit can be typical (e.g., 10-12)
      const data = await recommendationsService.getFeed({ page, limit: 12 });
      
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setProjects(prev => {
          // Prevent duplicates by checking ids
          const existingIds = new Set(prev.map(p => p.id));
          const newProjects = data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProjects];
        });
        setPage(prev => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching recommendations feed');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);
      const data = await recommendationsService.getFeed({ page: 1, limit: 12 });
      
      setProjects(data || []);
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setPage(2);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching initial recommendations feed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, loading, error, hasMore, fetchNextPage, loadInitial };
};

export const useInteract = () => {
  const interact = useCallback((projectId: string, type: 'view' | 'like') => {
    try {
      recommendationsService.interact({ projectId, interactionType: type }).catch(err => {
         console.warn('Failed to register interaction silently:', err.message);
      });
    } catch (err) {
      console.warn('Failed to start interaction silently', err);
    }
  }, []);
  
  return { interact };
};
