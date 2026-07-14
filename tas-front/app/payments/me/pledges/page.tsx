import { InvestmentHistoryTable } from '@/components/payments/InvestmentHistoryTable';

export default function ProfileInvestmentsPage() {
  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mis Inversiones</h1>
        <p className="text-slate-400">
          Historial de todos tus aportes y respaldos a proyectos.
        </p>
      </div>

      <InvestmentHistoryTable />
    </div>
  );
}
