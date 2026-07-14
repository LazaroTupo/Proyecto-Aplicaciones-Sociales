'use client';

import { motion } from 'framer-motion';
import { Brain, Cpu, Sparkles } from 'lucide-react';

export default function AILoadingState() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px] w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl">
      {/* Background Animated Gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Main Core Animation */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          className="absolute w-40 h-40 border-2 border-blue-500/30 rounded-full"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Ring */}
        <motion.div
          className="absolute w-32 h-32 border border-purple-500/40 rounded-full border-dashed"
          animate={{ rotate: -360, scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center Icon Pulse */}
        <motion.div
          className="relative bg-gradient-to-tr from-blue-600 to-purple-600 p-5 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          animate={{
            boxShadow: [
              '0 0 20px rgba(139,92,246,0.5)',
              '0 0 60px rgba(59,130,246,0.8)',
              '0 0 20px rgba(139,92,246,0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Brain className="w-12 h-12 text-white" strokeWidth={1.5} />
          
          {/* Floating Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-300"
            animate={{ scale: [0, 1.2, 0], rotate: [0, 90, 180] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-2 text-pink-300"
            animate={{ scale: [0, 1.2, 0], rotate: [0, -90, -180] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Text Animation */}
      <div className="relative z-10 mt-12 flex flex-col items-center space-y-3">
        <motion.h3
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Analizando con IA
        </motion.h3>
        
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <Cpu className="w-4 h-4 animate-pulse text-blue-400" />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            Procesando métricas de éxito...
          </motion.span>
        </div>
      </div>
    </div>
  );
}
