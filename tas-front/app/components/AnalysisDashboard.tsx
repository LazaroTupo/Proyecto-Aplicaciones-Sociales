'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, CheckCircle2, AlertCircle, ArrowRightCircle, BrainCircuit } from 'lucide-react';
import { getProjectById, analyzeProjectWithAI } from '../services/projects.service';
import { Project } from '../types/projects.types';
import { notification, Button } from 'antd';

interface Recommendation {
  type: 'positive' | 'warning' | 'negative' | 'action';
  title: string;
  desc: string;
}

interface AnalysisDashboardProps {
  id: string;
}

export default function AnalysisDashboard({ id }: AnalysisDashboardProps) {
  const [api, contextHolder] = notification.useNotification();
  const [project, setProject] = useState<Project>();
  const [analyzing, setAnalyzing] = useState(false);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const data = await getProjectById(id, token);
      setProject(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const updated = await analyzeProjectWithAI(id);
      setProject(updated);
      api.success({
        message: 'Análisis IA Completado',
        description: 'Se han calculado los nuevos índices predictivos.',
      });
    } catch (e: any) {
      api.error({
        message: 'Error en Análisis',
        description: e.response?.data?.message || 'Error al contactar al motor de IA.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const renderMeter = (value: number | null, label: string, color: string) => {
    const val = value ?? 0;
    const circumference = 502;
    const offset = circumference - (val / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="8" className="text-slate-200" fill="transparent" />
            <circle
              cx="64"
              cy="64"
              r="50"
              stroke="currentColor"
              strokeWidth="8"
              className={`${color} transition-all duration-1000 ease-out`}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-700">{val}%</span>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
    );
  };

  const getRecommendations = (p: Project): Recommendation[] => {
    const recs: Recommendation[] = [];
    if (!p.feasibilityIndex && !p.transparencyIndex) {
      recs.push({
        type: 'action',
        title: 'Ejecutar Análisis',
        desc: 'Presiona "Analizar con IA" para que el modelo Random Forest evalúe tu proyecto.',
      });
      return recs;
    }

    if ((p.feasibilityIndex ?? 0) > 75) {
      recs.push({ type: 'positive', title: 'Alta Viabilidad', desc: 'El proyecto tiene indicadores muy sólidos según el mercado actual.' });
    } else {
      recs.push({ type: 'warning', title: 'Riesgo de Viabilidad', desc: 'Revisa tu presupuesto y TRL. Los proyectos similares con menor experiencia suelen tener problemas para despegar.' });
    }

    if ((p.transparencyIndex ?? 0) < 60) {
      recs.push({ type: 'negative', title: 'Transparencia Baja', desc: 'Debes añadir más documentación técnica y videos de pitch. Aumenta la confianza de los inversores.' });
    } else {
      recs.push({ type: 'positive', title: 'Excelente Transparencia', desc: 'La documentación técnica y patentes/videos presentados transmiten mucha confianza.' });
    }

    return recs;
  };

  return (
    <div className="w-full space-y-8">
      {contextHolder}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">{project?.title || 'Cargando...'}</h2>
          <p className="text-sm text-slate-500 mt-1">{project?.resume || 'Sin descripción'}</p>
        </div>
        <div>
          <Button
            type="primary"
            size="large"
            loading={analyzing}
            onClick={handleAnalyze}
            icon={<BrainCircuit className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 border-none flex items-center gap-2"
          >
            Analizar con IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Índices */}
        <div className="lg:col-span-2 bg-white border border-slate-300 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Índices Predictivos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderMeter(project?.feasibilityIndex ?? null, 'Viabilidad', 'text-emerald-400')}
            {renderMeter(project?.transparencyIndex ?? null, 'Transparencia', 'text-blue-400')}
            {renderMeter(project?.communityValidationScore ?? null, 'Comunidad', 'text-amber-400')}
          </div>
        </div>

        {/* Panel de Recaudación */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
           <div className="absolute w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl -top-10 -right-10"></div>
           <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6 relative z-10">
              Recaudación Proyectada
           </h3>
           <div className="relative z-10">
             <div className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
               {project?.projectedRaisedAmount ? `${project.projectedRaisedAmount.toFixed(1)}%` : '---'}
             </div>
             <p className="text-sm text-indigo-100/80">
               Del presupuesto objetivo: <br/> <strong className="text-white">${project?.budget?.toLocaleString()}</strong>
             </p>
           </div>
        </div>

        {/* Panel de Recomendaciones */}
        <div className="lg:col-span-3 bg-white border border-slate-300 shadow-sm rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Recomendaciones del Modelo RF</h3>
              <p className="text-xs text-slate-500">Generadas mediante el algoritmo Random Forest y reglas heurísticas de validación.</p>
            </div>
          </div>

          <div className="space-y-4">
            {project && getRecommendations(project).map((rec, idx) => {
              let borderTheme = "";
              let iconTheme = "";
              let IconComponent = ArrowRightCircle;

              if (rec.type === 'positive') {
                borderTheme = "border-emerald-500/20 bg-green-50";
                iconTheme = "bg-emerald-500/10 text-emerald-600";
                IconComponent = CheckCircle2;
              } else if (rec.type === 'warning') {
                borderTheme = "border-amber-500/20 bg-amber-50";
                iconTheme = "bg-amber-500/10 text-amber-600";
                IconComponent = AlertCircle;
              } else if (rec.type === 'negative') {
                borderTheme = "border-rose-500/20 bg-red-50";
                iconTheme = "bg-rose-500/10 text-rose-600";
                IconComponent = AlertCircle;
              } else {
                borderTheme = "border-indigo-500/20 bg-indigo-50";
                iconTheme = "bg-indigo-500/10 text-indigo-600";
                IconComponent = Sparkles;
              }

              return (
                <div key={idx} className={`p-4 border ${borderTheme} rounded-xl flex items-start gap-3 transition hover:scale-[1.01] duration-200`}>
                  <div className={`p-1.5 ${iconTheme} rounded-lg shrink-0 mt-0.5`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}