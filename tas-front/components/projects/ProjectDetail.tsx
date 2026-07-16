'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../services/projects';
import { Calendar, Target, Award, Edit3, Trash2, ShieldCheck, PlayCircle, FileText, X } from 'lucide-react';
import { DeleteProjectModal } from '../ui/DeleteProjectModal';
import { PaymentModal } from '../payments/PaymentModal';
import { projectsService } from '../../services/projects';
import { toast } from 'sonner';

interface ProjectDetailProps {
  project: Project;
  isOwner?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onPublish?: () => Promise<void>;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  isOwner = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onPublish,
  onApprove,
  onReject
}) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<string[]>(project.documentUrls || []);

  React.useEffect(() => {
    setDocumentUrls(project.documentUrls || []);
  }, [project.documentUrls]);

  const handleFileDelete = async (fileName: string) => {
    try {
      await projectsService.deleteProjectFile(project.id, fileName);
      setDocumentUrls(prev => prev.filter(name => name !== fileName));
      toast.success('Archivo eliminado exitosamente');
    } catch (err) {
      toast.error('Error al eliminar el archivo');
    }
  };

  const raised = project.raisedAmount || 0;
  const progress = Math.min((raised / project.targetAmount) * 100, 100);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if(onDelete){
        await onDelete();
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Actions for Owner and Admin */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Status Badge */}
          {project.status === 'draft' && <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">Borrador</span>}
          {project.status === 'review' && <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">En Revisión</span>}
          {project.status === 'funding' && <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">En Recaudación</span>}
        </div>
        <div className="flex justify-end space-x-4">
          {/* Admin Actions */}
          {isAdmin && project.status === 'review' && (
            <>
              <button
                onClick={onApprove}
                className="flex items-center px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 font-medium transition-colors backdrop-blur-md"
              >
                <ShieldCheck size={18} className="mr-2" /> Aprobar Proyecto
              </button>
              <button
                onClick={onReject}
                className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 font-medium transition-colors backdrop-blur-md"
              >
                <X size={18} className="mr-2" /> Rechazar
              </button>
            </>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <>
              {project.status === 'draft' && (
                <button
                  onClick={onPublish}
                  className="flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-medium transition-colors shadow-lg shadow-brand-500/25"
                >
                  <Target size={18} className="mr-2" /> Enviar a Revisión
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-medium transition-colors backdrop-blur-md"
              >
                <Edit3 size={18} className="mr-2" /> Editar Proyecto
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 font-medium transition-colors backdrop-blur-md"
              >
                <Trash2 size={18} className="mr-2" /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[100px] -z-10 rounded-full" />
            
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {project.title}
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </motion.div>

          {/* Status & Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Detalles Técnicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-sm mb-1">Nivel TRL</div>
                <div className="text-2xl font-bold text-brand-400">Nivel {project.trlLevel || 'N/A'}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-sm mb-1">Estado del Proyecto</div>
                <div className="text-xl font-bold text-white capitalize">{project.status}</div>
              </div>
            </div>
          </motion.div>

          {documentUrls && documentUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center">
                <FileText className="mr-3 text-brand-400" /> Documentos de Sustento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentUrls.map((fileName, idx) => {
                  // In a real scenario, NEXT_PUBLIC_API_URL should be parsed if it has /api.
                  // For now, we assume the backend serves uploads statically on root.
                  // Since they aren't served right now by the backend, this is a placeholder URL that will work once the backend configures ServeStaticModule.
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                  const fileUrl = `${backendUrl}/uploads/projects/${project.id}/${fileName}`;
                  
                  return (
                    <div key={idx} className="flex items-center p-4 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-brand-500/50 rounded-xl transition-all group relative">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center overflow-hidden"
                      >
                        <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center mr-4 group-hover:bg-brand-500/40 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">{fileName}</p>
                          <p className="text-xs text-gray-400">Ver documento</p>
                        </div>
                      </a>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent triggering the link
                            handleFileDelete(fileName);
                          }}
                          className="absolute right-4 p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-full transition-colors"
                          title="Eliminar documento"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Funding & Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 border-t-4 border-t-brand-500 shadow-[0_0_30px_rgba(109,40,217,0.15)] relative overflow-hidden"
          >
            <div className="text-3xl font-bold text-white mb-2">
              S/ {raised.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mb-6">
              recaudados de la meta de <span className="text-white font-semibold">S/ {project.targetAmount.toLocaleString()}</span>
            </div>
            
            <div className="w-full bg-black/50 h-3 rounded-full mb-2 overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-500 to-pink-500 relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
            <div className="text-right text-sm font-bold text-brand-400 mb-8">{progress.toFixed(1)}%</div>

            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] transform hover:-translate-y-1"
            >
              Respaldar este Proyecto
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center">
              <ShieldCheck size={14} className="mr-1" /> Pago seguro vía PayPal
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Creador</h4>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {project.creator?.firstName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{project.creator?.firstName} {project.creator?.lastName}</div>
                <div className="text-sm text-brand-400">Creador Verificado</div>
              </div>
            </div>
          </motion.div>

          {project.rewards && project.rewards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-xl font-bold text-white mt-8 mb-4 flex items-center">
                <Award className="mr-2 text-brand-400" /> Recompensas
              </h4>
              {project.rewards.map((reward, i) => (
                <div key={i} className="glass-panel p-5 hover:border-brand-500/50 transition-colors cursor-pointer group">
                  <div className="text-2xl font-bold text-brand-400 mb-2">Aporte de S/ {reward.amount}+</div>
                  <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{reward.description}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        projectName={project.title}
        isDeleting={isDeleting}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        projectId={project.id} 
        rewards={project.rewards} 
      />
    </div>
  );
};
