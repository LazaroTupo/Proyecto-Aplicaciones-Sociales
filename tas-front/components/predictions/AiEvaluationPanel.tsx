'use client';
import { useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { usePredictions } from '@/hooks/usePredictions';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import AILoadingState from '@/components/predictions/AILoadingState';
import PredictionResult from '@/components/predictions/PredictionResult';

interface AiEvaluationPanelProps {
  projectId: string;
  autoEvaluate?: boolean;
}

export function AiEvaluationPanel({ projectId, autoEvaluate = false }: AiEvaluationPanelProps) {
  const { evaluate, loading: aiLoading, result, error: aiError } = usePredictions();

  const handleEvaluate = async () => {
    await evaluate(projectId);
  };

  useEffect(() => {
    if (autoEvaluate) {
      evaluate(projectId);
    }
  }, [projectId, autoEvaluate, evaluate]);

  return (
    <div className="mt-12">
      <div className="flex items-center space-x-2 mb-6">
        <BrainCircuit className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Evaluación de Inteligencia Artificial</h2>
      </div>

      <AnimatePresence mode="wait">
        {aiLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <AILoadingState />
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PredictionResult result={result} />
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleEvaluate} className="border-white/10">
                <BrainCircuit className="w-4 h-4 mr-2" />
                Re-evaluar Proyecto
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-8 sm:p-12 text-center flex flex-col items-center border border-purple-500/20 bg-gradient-to-br from-white/5 to-purple-500/5">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <BrainCircuit className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Obtén Feedback con IA</h3>
              <p className="text-zinc-400 max-w-lg mb-8 leading-relaxed">
                Nuestra inteligencia artificial analizará los datos de tu proyecto para predecir su probabilidad de éxito, su viabilidad y ofrecerte recomendaciones personalizadas para mejorarlo.
              </p>
              
              <Button 
                onClick={handleEvaluate} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg px-8 py-6 text-lg rounded-full"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Evaluar con IA ahora
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
