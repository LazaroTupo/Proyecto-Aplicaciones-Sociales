import React from 'react';
import { ProjectWizard } from '@/components/projects/ProjectWizard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Proyecto | ImpulsaTec',
  description: 'Inicia un nuevo proyecto y haz realidad tus ideas en ImpulsaTec.',
};

export default function CreateProjectPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Lanza tu Proyecto</h1>
        <p className="text-gray-400 text-lg">
          Completa los detalles a continuación. Nuestra IA analizará tu propuesta para darte las mejores probabilidades de éxito.
        </p>
      </div>
      <ProjectWizard />
    </main>
  );
}
