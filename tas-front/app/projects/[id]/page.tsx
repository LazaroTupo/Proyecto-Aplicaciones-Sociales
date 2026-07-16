'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUsers';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectDetailSkeleton } from '@/components/projects/ProjectDetailSkeleton';
import { toast } from 'sonner';
import { useInteract } from '@/hooks/useRecommendations';

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { fetchProjectById, deleteProject, publishProject, updateProjectStatus, loading, error } = useProjects();
  const { user } = useUser();
  const [project, setProject] = useState<any>(null);
  const { interact } = useInteract();
  
  const isOwner = user?.id === project?.creator?.id;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      loadProject();
      interact(id, 'view');
    }
  }, [id, interact]);

  const loadProject = async () => {
    const data = await fetchProjectById(id);
    if (data) {
      setProject(data);
    }
  };

  const handleEdit = () => {
    router.push(`/projects/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      toast.success('Proyecto eliminado exitosamente');
      router.push('/projects');
    } catch (err) {
      toast.error('No se pudo eliminar el proyecto');
    }
  };

  const handlePublish = async () => {
    try {
      await publishProject(id);
      toast.success('Proyecto enviado a revisión exitosamente');
      // Optimistic UI update or reload
      setProject({ ...project, status: 'review' });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleApprove = async () => {
    try {
      const updated = await updateProjectStatus(id, 'funding');
      if (updated) {
        toast.success('Proyecto aprobado exitosamente');
        setProject(updated);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleReject = async () => {
    try {
      const updated = await updateProjectStatus(id, 'draft');
      if (updated) {
        toast.warning('Proyecto rechazado y devuelto a borrador');
        setProject(updated);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading || !project) {
    if (error) {
      return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="glass-panel p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button onClick={() => router.push('/projects')} className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors">
              Volver al Explorador
            </button>
          </div>
        </div>
      );
    }
    return (
      <main className="min-h-screen pt-24 pb-12">
        <ProjectDetailSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <ProjectDetail
        project={project}
        isOwner={isOwner}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </main>
  );
}
