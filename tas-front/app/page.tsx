'use client';

import React, { useState } from 'react';
import { Clock, Sparkles, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  deadline: string;
}

interface ProjectsDashboardProps {
  onSelectProjectForAnalysis?: (projectId: string) => void;
}

export default function App({ onSelectProjectForAnalysis }: ProjectsDashboardProps) {
  const [projects] = useState<Project[]>([
    {
      id: 'p1',
      title: 'Bio-Purificador de Microalgas',
      description: 'Prototipo de purificador de aire urbano utilizando reactores cargados de microalgas vivas para capturar CO2 en campus universitarios.',
      target: 2500,
      raised: 1850,
      deadline: '2026-06-25',
    },
    {
      id: 'p2',
      title: 'App de Tutoría Inteligente (UNI-Learn)',
      description: 'Plataforma de emparejamiento tutor-estudiante basada en IA para resolver dudas académicas personalizadas en ciencias básicas y cálculo.',
      target: 1200,
      raised: 400,
      deadline: '2026-06-05',
    }
  ]);

  const getDaysRemaining = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} días restantes` : 'Expirado';
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Simulador Activo
          </span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No hay proyectos registrados en este momento.</p>
          <p className="text-xs text-slate-500 mt-1">Regístrate en la sección correspondiente para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progressPercent = Math.min(
              Math.round((project.raised / project.target) * 100),
              100
            );
            const daysLabel = getDaysRemaining(project.deadline);

            return (
              <div
                key={project.id}
                className="bg-white border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg">
                      ID: {project.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {daysLabel}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-500 uppercase tracking-wider">
                        Objetivo Recaudado
                      </span>
                      <span className="text-indigo-400">
                        ${project.raised.toLocaleString()} / ${project.target.toLocaleString()} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProjectForAnalysis?.(project.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Ver Predicción de Éxito
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}