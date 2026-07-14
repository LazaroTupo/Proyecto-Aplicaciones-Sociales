import { ProjectPledgesTable } from '@/components/payments/ProjectPledgesTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatorProjectPledgesPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/creator/projects"
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Aportes Recibidos</h1>
          <p className="text-slate-400">
            Revisa todos los aportes y recompensas de este proyecto.
          </p>
        </div>
      </div>

      <ProjectPledgesTable projectId={params.id} />
    </div>
  );
}
