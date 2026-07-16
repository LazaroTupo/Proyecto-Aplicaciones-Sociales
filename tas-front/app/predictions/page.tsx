'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, BrainCircuit, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUsers';
import { GlassCard } from '@/components/ui/GlassCard';
import { AiEvaluationPanel } from '@/components/predictions/AiEvaluationPanel';

export default function PredictionsPage() {
  const { user, loading: userLoading } = useUser();
  const { fetchProjects, loading: projectsLoading } = useProjects();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      if (user?.id) {
        // Fetch projects created by this user
        const response = await fetchProjects({ creatorId: user.id });
        if (response?.data) {
          setProjects(response.data);
        }
      }
    };
    if (user) {
      loadProjects();
    }
  }, [user, fetchProjects]);

  if (userLoading || (projectsLoading && projects.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div>
          <Link href="/profile">
            <button className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver
            </button>
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <BrainCircuit className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Evaluaciones de IA
            </h1>
          </div>
          <p className="text-zinc-400">Selecciona uno de tus proyectos para analizar su probabilidad de éxito y recibir recomendaciones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar list of projects */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Tus Proyectos</h2>
            
            {projects.length === 0 ? (
              <GlassCard className="p-6 text-center border-white/5">
                <p className="text-zinc-500 text-sm">No tienes proyectos creados aún.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                        selectedProjectId === project.id 
                          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="truncate pr-4">
                        <h3 className="font-medium text-white truncate">{project.title}</h3>
                        <p className="text-xs text-zinc-400 mt-1 capitalize">{project.status}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        selectedProjectId === project.id ? 'text-purple-400' : 'text-zinc-500'
                      }`} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Main Evaluation Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedProjectId ? (
                <motion.div
                  key={selectedProjectId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AiEvaluationPanel projectId={selectedProjectId} autoEvaluate={true} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex items-center justify-center"
                >
                  <GlassCard className="p-10 text-center flex flex-col items-center border-dashed border-white/10 bg-white/[0.02]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <BrainCircuit className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400">Selecciona un proyecto de la lista para comenzar su análisis con Inteligencia Artificial.</p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
