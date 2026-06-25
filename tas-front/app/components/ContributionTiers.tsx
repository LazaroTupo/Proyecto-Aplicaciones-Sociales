import { Empty } from 'antd';
import { GiftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { TierProject } from '../types/projects.types';

interface ContributionTiersProps {
  allowFree: boolean;
  tiers: TierProject[];
}

export function ContributionTiers({ allowFree, tiers }: ContributionTiersProps) {
  if (allowFree) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-5 rounded-md bg-slate-50 text-center">
        <GiftOutlined className="text-3xl text-slate-400" />
        <span className="text-slate-600 font-medium">
          El aporte es libre, no hay plan de aportes
        </span>
        <span className="text-sm text-slate-400">
          Puedes contribuir con el monto que desees
        </span>
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Empty description="Aún no se han definido planes de aporte" />
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const sortedTiers = [...tiers].sort((a, b) => a.amount - b.amount);

  return (
    <div className="flex flex-col gap-3">
      {sortedTiers.map((tier, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 rounded-md shadow-sm bg-slate-50 border border-slate-100"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 shrink-0">
            <span className="text-emerald-700 font-semibold text-sm">
              {formatCurrency(tier.amount).replace('.00', '')}
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500 text-xs" />
              <span className="text-sm font-medium text-slate-700">
                Aporte de {formatCurrency(tier.amount)}
              </span>
            </div>
            <span className="text-sm text-slate-500">{tier.benefit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}