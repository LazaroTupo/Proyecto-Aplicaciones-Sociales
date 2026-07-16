"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, LayoutGrid, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useUser } from "@/hooks/useUsers";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function AdminProjectsReviewPage() {
  const { fetchProjects, loading: projectsLoading, error } = useProjects();
  const { user, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadProjects();
    }
  }, [isAdmin]);

  const loadProjects = async () => {
    const response = await fetchProjects({ status: 'review', limit: 100 });
    if (response) {
      setProjects(response.data);
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-black">
        <p className="text-red-400">Acceso denegado. Se requieren permisos de administrador.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation (Mock Admin Menu) */}
        <div className="md:col-span-1 space-y-2">
          <GlassCard className="p-4 flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3">Panel Admin</h2>
            
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all bg-white/10 text-white font-medium">
              <ShieldCheck className="w-5 h-5" />
              <span>Revisión de Proyectos</span>
            </div>
            
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-white">
                Revisión de Proyectos
              </h1>
              <p className="text-zinc-400 mt-1">Proyectos pendientes de aprobación para entrar a recaudación.</p>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : projects.length === 0 ? (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-brand-500/20">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">¡Todo al día!</h3>
                <p className="text-zinc-400 mb-6 max-w-sm">
                  No hay proyectos pendientes de revisión en este momento.
                </p>
                <button 
                  onClick={() => loadProjects()}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10"
                >
                  Actualizar Vista
                </button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
