import React from 'react';
import { Metadata } from 'next';
import { Rocket, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cómo Funciona | ImpulsaTec',
  description: 'Aprende cómo crear y apoyar proyectos en ImpulsaTec.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Cómo Funciona <span className="text-gradient">ImpulsaTec</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          ImpulsaTec es el ecosistema donde las grandes ideas encuentran el capital necesario para convertirse en realidad, potenciado por Inteligencia Artificial.
        </p>
      </div>

      <div className="space-y-16">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center gap-8 glass-panel p-8">
          <div className="w-16 h-16 shrink-0 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">1. Comparte tu Visión</h3>
            <p className="text-gray-400 leading-relaxed">
              Crea tu proyecto explicando qué quieres lograr, tus metas de financiamiento y qué recompensas ofreces. 
              Nuestra IA evaluará tu propuesta en tiempo real y te sugerirá mejoras para aumentar tu probabilidad de éxito antes de publicarla.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center gap-8 glass-panel p-8">
          <div className="w-16 h-16 shrink-0 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400">
            <Rocket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">2. Alcanza tus Metas</h3>
            <p className="text-gray-400 leading-relaxed">
              Inversores y patrocinadores de todo el mundo pueden explorar tu campaña. Nuestro sistema de recomendación conecta tu proyecto 
              con usuarios que tienen historiales de inversión en ideas similares, aumentando tu alcance de forma orgánica.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center gap-8 glass-panel p-8">
          <div className="w-16 h-16 shrink-0 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">3. Financiamiento Seguro</h3>
            <p className="text-gray-400 leading-relaxed">
              Gracias a nuestra integración con PayPal y rigurosos procesos KYC, todas las transacciones son seguras. 
              Una vez completada la campaña, recibirás los fondos para hacer realidad tu proyecto y entregar las recompensas prometidas.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
