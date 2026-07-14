'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../services/projects';
import Link from 'next/link';
import { Target, Users, Calendar, Sparkles, Heart } from 'lucide-react';
import { useInteract } from '../../hooks/useRecommendations';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const raised = project.raisedAmount || 0;
  const progress = Math.min((raised / project.targetAmount) * 100, 100);
  
  const [isLiked, setIsLiked] = useState(false);
  const { interact } = useInteract();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      interact(project.id, 'like');
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-panel group relative overflow-hidden flex flex-col h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6 flex-1 flex flex-col z-10 relative">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 border border-white/5 backdrop-blur-md transition-colors"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart 
              size={18} 
              className={`transition-colors duration-300 ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} 
            />
          </motion.div>
        </button>

        <div className="flex justify-between items-start mb-4 pr-10">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
            {project.category}
          </span>
          {project.aiSuccessProbability && (
            <span className="flex items-center text-xs text-yellow-400 font-medium bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
              <Sparkles size={12} className="mr-1" />
              {project.aiSuccessProbability}% Match
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {project.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
          {project.description}
        </p>

        <div className="space-y-4 mt-auto">
          <div>
            <div className="flex justify-between text-sm mb-1 text-gray-300">
              <span>Recaudado</span>
              <span className="font-semibold text-white">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-brand-500 to-pink-500"
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Target size={14} className="text-brand-400" />
              <span>S/ {project.targetAmount.toLocaleString()} meta</span>
            </div>
            {project.durationDays && (
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-blue-400" />
                <span>{project.durationDays} días</span>
              </div>
            )}
          </div>
          
          <Link href={`/projects/${project.id}`}>
            <button className="w-full mt-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all group-hover:border-brand-500/50">
              Ver Detalles
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
