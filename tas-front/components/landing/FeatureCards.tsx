'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-brand-500" />,
    title: 'Análisis con IA',
    description: 'Nuestra inteligencia artificial evalúa la viabilidad de tu proyecto y sugiere mejoras en tiempo real.'
  },
  {
    icon: <Rocket className="w-8 h-8 text-brand-500" />,
    title: 'Financiamiento Rápido',
    description: 'Conecta con cientos de inversores en un ecosistema optimizado para conversiones y pagos seguros.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-brand-500" />,
    title: 'Seguridad Total',
    description: 'Transacciones seguras vía PayPal y validación KYC rigurosa para proteger a la comunidad.'
  }
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const FeatureCards = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Por qué elegir <span className="text-gradient">ImpulsaTec</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hemos construido la plataforma más avanzada para garantizar que tus ideas encuentren el respaldo que merecen.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="glass-panel p-8 group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="bg-brand-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
