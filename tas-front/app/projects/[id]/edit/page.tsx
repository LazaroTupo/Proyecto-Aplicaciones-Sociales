'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectWizard } from '@/components/projects/ProjectWizard';
import { useProjects } from '@/hooks/useProjects';
import { Loader2 } from 'lucide-react';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { fetchProjectById, error } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    setIsLoading(true);
    const data = await fetchProjectById(id);
    if (data) {
      setProject(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={40} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error || 'Proyecto no encontrado'}</p>
          <button onClick={() => router.push('/projects')} className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Editar Proyecto</h1>
        <p className="text-gray-400 text-lg">
          Actualiza los detalles de "{project.title}".
        </p>
      </div>
      <ProjectWizard existingProject={project} />
    </main>
  );
}
