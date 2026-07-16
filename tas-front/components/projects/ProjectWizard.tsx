'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjects } from '../../hooks/useProjects';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Plus, Trash2, UploadCloud, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(255),
  description: z.string().min(20, 'La descripción es muy corta'),
  targetAmount: z.coerce.number().min(100, 'La meta mínima es S/ 100'),
  durationDays: z.coerce.number().min(1, 'Debe durar al menos 1 día').max(90, 'Máximo 90 días'),
  trlLevel: z.coerce.number().min(1).max(9),
  hasVideo: z.boolean().default(false),
  category: z.string().min(2, 'Selecciona una categoría'),
  rewards: z.array(
    z.object({
      amount: z.coerce.number().min(1, 'Monto inválido'),
      description: z.string().min(5, 'Descripción muy corta'),
    })
  ).optional(),
});

type ProjectFormData = z.infer<typeof schema>;

const steps = [
  { id: 'basic', title: 'Información Básica' },
  { id: 'technical', title: 'Detalles Técnicos' },
  { id: 'rewards_files', title: 'Recompensas y Archivos' },
];

export const ProjectWizard: React.FC<{ existingProject?: any }> = ({ existingProject }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const { createProject, updateProject, loading } = useProjects();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [existingDocumentUrls, setExistingDocumentUrls] = useState<string[]>(existingProject?.documentUrls || []);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleExistingFileDelete = async (fileName: string) => {
    try {
      if (existingProject?.id) {
        // You can import projectsService or use it directly if imported
        const { projectsService } = await import('../../services/projects');
        await projectsService.deleteProjectFile(existingProject.id, fileName);
        setExistingDocumentUrls(prev => prev.filter(name => name !== fileName));
        toast.success('Archivo eliminado exitosamente');
      }
    } catch (err) {
      toast.error('Error al eliminar el archivo');
    }
  };

  const { control, handleSubmit, trigger, getValues, setValue, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: existingProject?.title || '',
      description: existingProject?.description || '',
      targetAmount: existingProject?.targetAmount || 1000,
      durationDays: existingProject?.durationDays || 30,
      trlLevel: existingProject?.trlLevel || 1,
      hasVideo: existingProject?.hasVideo || false,
      category: existingProject?.category || 'Tecnología',
      rewards: existingProject?.rewards?.length ? existingProject.rewards : [{ amount: 10, description: '' }],
    }
  });

  const { fields: rewardFields, append: addReward, remove: removeReward } = useFieldArray({
    control,
    name: "rewards"
  });

  const handleEnhanceDescription = async () => {
    const currentText = getValues("description");
    if (!currentText || currentText.trim() === "") {
      toast.error("Por favor, escribe al menos una breve descripción antes de mejorarla con IA.");
      return;
    }

    try {
      setIsEnhancing(true);
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });

      if (!res.ok) {
        throw new Error("No se pudo conectar con el asistente de IA");
      }

      const data = await res.json();
      if (data.enhancedText) {
        setValue("description", data.enhancedText, { shouldValidate: true, shouldDirty: true });
        toast.success("¡Descripción mejorada exitosamente con IA!", {
          className: "bg-brand-500/10 border-brand-500/20 text-brand-400 backdrop-blur-md"
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocurrió un error al intentar mejorar el texto.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ['title', 'description', 'category'];
    else if (currentStep === 1) fieldsToValidate = ['targetAmount', 'durationDays', 'trlLevel', 'hasVideo'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 10) {
        toast.error('Máximo 10 archivos permitidos');
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!existingProject && files.length === 0) {
      toast.error('Debes subir al menos un archivo de sustento');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('targetAmount', data.targetAmount.toString());
    formData.append('durationDays', data.durationDays.toString());
    formData.append('trlLevel', data.trlLevel.toString());
    formData.append('hasVideo', data.hasVideo.toString());
    formData.append('category', data.category);
    
    if (data.rewards && data.rewards.length > 0) {
      // Clean up rewards to prevent ValidationPipe errors (whitelist/forbidNonWhitelisted)
      const cleanRewards = data.rewards.map((r: any) => ({
        amount: Number(r.amount),
        description: String(r.description)
      }));
      formData.append('rewards', JSON.stringify(cleanRewards));
    }

    files.forEach(file => {
      formData.append('sustentos', file);
    });

    try {
      let result;
      if (existingProject) {
        result = await updateProject(existingProject.id, formData);
        toast.success('Proyecto actualizado exitosamente');
        router.push(`/projects/${existingProject.id}`);
      } else {
        result = await createProject(formData);
        if (result) {
          setAiData({
            successProbability: result.aiSuccessProbability,
            feasibilityIndex: result.aiFeasibilityIndex,
            recommendations: result.aiRecommendations
          });
          setCreatedProjectId(result.id);
          setIsSuccess(true);
        }
      }
    } catch (error) {
      toast.error('Error al guardar el proyecto');
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">¡Proyecto Creado con Éxito!</h2>
        
        {aiData && (
          <div className="text-left mt-8 p-6 bg-black/40 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-brand-400 mb-4 flex items-center">
              Evaluación de la IA <SparklesIcon className="ml-2" size={18} />
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-panel p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Probabilidad de Éxito</p>
                <p className="text-2xl font-bold text-white">{aiData.successProbability}%</p>
              </div>
              <div className="glass-panel p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Índice de Viabilidad</p>
                <p className="text-2xl font-bold text-white">{aiData.feasibilityIndex} / 10</p>
              </div>
            </div>
            {aiData.recommendations && aiData.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Recomendaciones:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 text-sm">
                  {aiData.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button onClick={() => router.push(`/projects/${createdProjectId}`)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors">
            Ver Mi Proyecto
          </button>
          <button onClick={() => router.push('/profile')} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10">
            Ir a mi Perfil
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
              currentStep === index ? 'bg-brand-600 border-brand-500 text-white shadow-[0_0_15px_rgba(109,40,217,0.5)]' :
              currentStep > index ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-black/50 border-white/10 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <span className={`text-xs mt-2 font-medium ${currentStep >= index ? 'text-white' : 'text-gray-500'}`}>
              {step.title}
            </span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute left-0 top-5 w-full h-[2px] bg-white/10 -z-10" />
      </div>

      {/* Form Area */}
      <div className="glass-panel p-8 relative overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
          // Prevent accidental form submission when pressing Enter in text inputs
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título del Proyecto</label>
                    <Controller name="title" control={control} render={({ field }) => (
                      <input {...field} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ej. Brazo robótico de bajo costo" />
                    )} />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                    <Controller name="category" control={control} render={({ field }) => (
                      <select {...field} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none">
                        <option value="Tecnología">Tecnología</option>
                        <option value="Salud">Salud</option>
                        <option value="Educación">Educación</option>
                        <option value="Medio Ambiente">Medio Ambiente</option>
                        <option value="Arte y Cultura">Arte y Cultura</option>
                      </select>
                    )} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descripción Detallada</label>
                    <div className="relative">
                      <Controller name="description" control={control} render={({ field }) => (
                        <textarea {...field} rows={7} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pb-12 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Describe el problema y tu solución..." />
                      )} />
                      <button
                        type="button"
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancing}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnhancing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {isEnhancing ? "Mejorando..." : "✨ Mejorar con IA"}
                      </button>
                    </div>
                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 1: Technical Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meta de Recaudación (S/)</label>
                      <Controller name="targetAmount" control={control} render={({ field }) => (
                        <input type="number" {...field} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="1000" />
                      )} />
                      {errors.targetAmount && <p className="text-red-400 text-xs mt-1">{errors.targetAmount.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duración (Días)</label>
                      <Controller name="durationDays" control={control} render={({ field }) => (
                        <input type="number" {...field} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="30" />
                      )} />
                      {errors.durationDays && <p className="text-red-400 text-xs mt-1">{errors.durationDays.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nivel TRL (Technology Readiness Level)</label>
                    <Controller name="trlLevel" control={control} render={({ field }) => (
                      <div className="flex items-center space-x-4">
                        <input type="range" min="1" max="9" {...field} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                        <span className="w-8 text-center text-xl font-bold text-brand-400">{field.value}</span>
                      </div>
                    )} />
                    <p className="text-xs text-gray-500 mt-2">1: Idea básica, 9: Sistema probado y operando.</p>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    <Controller name="hasVideo" control={control} render={({ field }) => (
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500" />
                    )} />
                    <label className="text-sm font-medium text-gray-300">Incluiré un video en los archivos (Sugerido por IA)</label>
                  </div>
                </div>
              )}

              {/* Step 2: Rewards and Files */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-300">Recompensas (Opcional)</label>
                      <button type="button" onClick={() => addReward({ amount: 10, description: '' })} className="text-xs flex items-center text-brand-400 hover:text-brand-300">
                        <Plus size={14} className="mr-1" /> Añadir
                      </button>
                    </div>
                    <div className="space-y-3">
                      {rewardFields.map((field, index) => (
                        <div key={field.id} className="flex space-x-3 items-start">
                          <div className="w-32">
                            <Controller name={`rewards.${index}.amount`} control={control} render={({ field: f }) => (
                              <input type="number" {...f} placeholder="Monto" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                            )} />
                            {errors.rewards?.[index]?.amount && <p className="text-red-400 text-xs mt-1">{errors.rewards[index]?.amount?.message}</p>}
                          </div>
                          <div className="flex-1">
                            <Controller name={`rewards.${index}.description`} control={control} render={({ field: f }) => (
                              <input type="text" {...f} placeholder="Descripción de la recompensa" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                            )} />
                            {errors.rewards?.[index]?.description && <p className="text-red-400 text-xs mt-1">{errors.rewards[index]?.description?.message}</p>}
                          </div>
                          <button type="button" onClick={() => removeReward(index)} className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-4">Archivos de Sustento (Requerido)</label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 transition-colors relative cursor-pointer group">
                      <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf,video/*" />
                      <UploadCloud className="mx-auto text-gray-400 group-hover:text-brand-400 transition-colors mb-3" size={40} />
                      <p className="text-sm text-gray-300">Arrastra archivos aquí o haz clic para subir</p>
                      <p className="text-xs text-gray-500 mt-2">Máximo 10 archivos (Imágenes, PDF, Videos cortas)</p>
                    </div>
                    
                    {existingDocumentUrls.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {existingDocumentUrls.map((fileName, idx) => (
                          <div key={idx} className="flex items-center bg-brand-500/10 border border-brand-500/20 rounded-lg py-1 px-3">
                            <span className="text-xs text-brand-300 truncate max-w-[150px]">{fileName}</span>
                            <button type="button" onClick={() => handleExistingFileDelete(fileName)} className="ml-2 text-red-400 hover:text-red-300">
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {files.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center bg-white/5 border border-white/10 rounded-lg py-1 px-3">
                            <span className="text-xs text-gray-300 truncate max-w-[150px]">{file.name} (Nuevo)</span>
                            <button type="button" onClick={() => removeFile(idx)} className="ml-2 text-red-400 hover:text-red-300">
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
            <button
              key="prev-btn"
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0 || loading}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowLeft size={18} className="mr-2" /> Anterior
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(109,40,217,0.3)]"
              >
                Siguiente <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(219,39,119,0.4)] disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Procesando...</>
                ) : (
                  'Guardar Proyecto'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const XIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const SparklesIcon = ({ size, className }: { size: number, className?: string }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
