'use client';

import React, { useEffect, useRef } from 'react';
import { useRecommendationsFeed } from '@/hooks/useRecommendations';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const RecommendationsFeed: React.FC = () => {
  const { projects, loading, error, hasMore, fetchNextPage, loadInitial } = useRecommendationsFeed();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [observerTarget, fetchNextPage, hasMore, loading]);

  if (error) {
    return (
      <div className="flex justify-center items-center py-20 text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-10 text-center relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4"
        >
          <Sparkles size={16} />
          <span className="text-sm font-medium">Para ti</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4"
        >
          Proyectos Recomendados
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          Descubre iniciativas que conectan con tus intereses y suma tu apoyo a las ideas del mañana.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={`${project.id}-${index}`} project={project} index={index % 12} />
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center items-center py-12 mt-4">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-brand-400"
          >
            <Loader2 className="animate-spin w-8 h-8" />
            <span className="text-sm font-medium">Cargando recomendaciones...</span>
          </motion.div>
        )}
        {!hasMore && projects.length > 0 && !loading && (
          <div className="text-gray-500 text-sm">
            Has llegado al final de las recomendaciones.
          </div>
        )}
        {!hasMore && projects.length === 0 && !loading && (
          <div className="text-gray-500 text-sm">
            No hay recomendaciones disponibles en este momento.
          </div>
        )}
      </div>
    </div>
  );
};
