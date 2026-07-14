'use client';

import React, { useEffect, useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProjectGrid: React.FC = () => {
  const { fetchProjects, loading, error } = useProjects();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadProjects = async (isNewSearch = false) => {
    const currentPage = isNewSearch ? 1 : page;
    const response = await fetchProjects({ page: currentPage, limit: 12, search });
    
    if (response) {
      if (isNewSearch) {
        setProjects(response.data);
      } else {
        setProjects(prev => [...prev, ...response.data]);
      }
      setHasMore(response.page < response.lastPage);
      if (isNewSearch) setPage(2);
      else setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProjects(true);
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Explorar Proyectos</h1>
          <p className="text-gray-400">Descubre iniciativas increíbles y apoya el futuro.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all sm:text-sm backdrop-blur-md"
            placeholder="Buscar por título, categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center">
          <RefreshCw className="mr-2" size={20} />
          {error}
        </div>
      )}

      {projects.length === 0 && !loading && !error && (
        <div className="text-center py-20 glass-panel">
          <p className="text-gray-400 text-lg">No se encontraron proyectos.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center mt-12 mb-4">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      )}

      {!loading && hasMore && projects.length > 0 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => loadProjects(false)}
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
          >
            Cargar más proyectos
          </button>
        </div>
      )}
    </div>
  );
};
