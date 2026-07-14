'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-pink-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Haz realidad tus <br className="hidden md:block" />
            <span className="text-gradient">ideas brillantes</span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            ImpulsaTec conecta a creadores visionarios con inversores apasionados, 
            potenciado con Inteligencia Artificial para asegurar tu éxito.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/projects/create">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(109,40,217,0.5)] hover:bg-brand-500 transition-colors w-full sm:w-auto"
              >
                Comienza tu Proyecto
              </motion.button>
            </Link>
            <Link href="/projects">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 text-white backdrop-blur-md rounded-full font-bold text-lg border border-white/10 hover:bg-white/20 transition-colors w-full sm:w-auto"
              >
                Explorar Proyectos
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
