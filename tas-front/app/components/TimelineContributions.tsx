import { Timeline, Empty } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { Contribution } from '../types/projects.types';

interface ContributionsTimelineProps {
  contributions: Contribution[];
}

export function ContributionsTimeline({ contributions }: ContributionsTimelineProps) {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Empty description="Aún no hay contribuciones registradas" />
      </div>
    );
  }

  // Ordenamos de la más reciente a la más antigua
  const sorted = [...contributions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));

  const totalRecaudado = sorted.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-1">
        <span className="text-sm text-slate-500">
          {sorted.length} {sorted.length === 1 ? 'contribución' : 'contribuciones'}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          Total: {formatCurrency(totalRecaudado)}
        </span>
      </div>

      <Timeline
        items={sorted.map((contribution) => ({
          dot: (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 shrink-0">
              <DollarOutlined className="text-emerald-600 text-xs" />
            </div>
          ),
          children: (
            <div className="flex flex-col p-4 rounded-md shadow-sm bg-slate-50 mb-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-800">
                  {contribution.user.name}
                </span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(contribution.amount)}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1">
                {formatDate(contribution.createdAt)}
              </span>
            </div>
          ),
        }))}
      />
    </div>
  );
}