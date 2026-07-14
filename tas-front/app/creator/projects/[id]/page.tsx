'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, BrainCircuit, Info, Calendar, Target, DollarSign, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { GlassCard } from '@/components/ui/GlassCard';
import { AiEvaluationPanel } from '@/components/predictions/AiEvaluationPanel';
import { Project } from '@/services/projects';

export default function CreatorProjectDashboard() {
  const params = useParams();
  const id = params.id as string;
  
  
  const { fetchProjectById, loading: projectLoading, error: projectError } = useProjects();
  
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      const data = await fetchProjectById(id);
      if (data) setProject(data);
    };
    loadProject();
  }, [id, fetchProjectById]);


  if (projectLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-red-400">{projectError || 'Error al cargar el proyecto.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/profile">
              <button className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver al Perfil
              </button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Dashboard del Proyecto
            </h1>
            <p className="text-zinc-400 mt-1">Gestiona y evalúa "{project.title}"</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href={`/creator/projects/${id}/pledges`}>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <DollarSign className="w-4 h-4 mr-2" />
                Ver Aportes
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Evaluation Section */}
        <AiEvaluationPanel projectId={id} />

      </div>
    </div>
  );
}

