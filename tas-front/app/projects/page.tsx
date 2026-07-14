import React from 'react';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorar Proyectos | ImpulsaTec',
  description: 'Descubre y apoya proyectos innovadores en ImpulsaTec.',
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <ProjectGrid />
    </main>
  );
}
