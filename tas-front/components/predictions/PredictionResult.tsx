'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PredictionResult as IPredictionResult } from '@/services/predictions';
import { Target, Lightbulb, TrendingUp, AlertTriangle, Sparkles, Eye, Info } from 'lucide-react';

interface PredictionResultProps {
  result: IPredictionResult;
}

export default function PredictionResult({ result }: PredictionResultProps) {
  // Data formatting for Recharts
  const successData = [
    { name: 'Probabilidad', value: result.successProbability },
    { name: 'Riesgo', value: 100 - result.successProbability },
  ];

  const feasibilityData = [
    { name: 'Viabilidad', value: result.feasibilityIndex * 10 },
    { name: 'Margen', value: 100 - result.feasibilityIndex * 10 },
  ];

  const transparencyData = [
    { name: 'Transparencia', value: result.transparencyIndex * 10 },
    { name: 'Margen', value: 100 - result.transparencyIndex * 10 },
  ];

  // Colors for charts
  const COLORS_SUCCESS = ['#10b981', '#1f2937']; // Emerald and dark gray
  const COLORS_FEASIBILITY = ['#3b82f6', '#1f2937']; // Blue and dark gray
  const COLORS_TRANSPARENCY = ['#a855f7', '#1f2937']; // Purple and dark gray

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Análisis Completado
        </h2>
        <p className="text-gray-400">
          La inteligencia artificial ha evaluado tu proyecto.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Success Probability */}
        <motion.div variants={itemVariants} className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-center space-x-2 mb-4 text-emerald-400 relative group cursor-help">
            <Target className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Probabilidad de Éxito
              <Info className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </h3>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-emerald-500/30 rounded-xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Predice la probabilidad estadística de que el proyecto alcance su meta de recaudación basándose en el análisis de recompensas, calidad del pitch y categoría.
            </div>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  stroke="none"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_SUCCESS[index % COLORS_SUCCESS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{result.successProbability.toFixed(0)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Feasibility Index */}
        <motion.div variants={itemVariants} className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-center space-x-2 mb-4 text-blue-400 relative group cursor-help">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Índice de Viabilidad
              <Info className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </h3>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-blue-500/30 rounded-xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Mide (de 0 a 10) qué tan realista y ejecutable es el proyecto evaluando el Nivel de Madurez Tecnológica (TRL), la coherencia del cronograma y el presupuesto.
            </div>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feasibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  stroke="none"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {feasibilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_FEASIBILITY[index % COLORS_FEASIBILITY.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: any) => [`${(Number(value) / 10).toFixed(1)} / 10`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{result.feasibilityIndex.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>

        {/* Transparency Index */}
        <motion.div variants={itemVariants} className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-center space-x-2 mb-4 text-purple-400 relative group cursor-help">
            <Eye className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Transparencia
              <Info className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-purple-500/30 rounded-xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Evalúa (de 0 a 10) la claridad y nivel de detalle de la información proporcionada al inversor, incluyendo desglose de costos, riesgos y equipo fundador.
            </div>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transparencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  stroke="none"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {transparencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_TRANSPARENCY[index % COLORS_TRANSPARENCY.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#a855f7' }}
                  formatter={(value: any) => [`${(Number(value) / 10).toFixed(1)} / 10`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{result.transparencyIndex.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommendations Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-2 mb-2 text-yellow-400">
          <Lightbulb className="w-6 h-6" />
          <h3 className="text-xl font-semibold text-white">Recomendaciones Clave</h3>
        </div>
        
        {result.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="flex items-start space-x-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-4 rounded-xl"
              >
                <div className="mt-1 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-400 bg-white/5 p-4 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
            <span>No se generaron recomendaciones específicas en esta iteración.</span>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
