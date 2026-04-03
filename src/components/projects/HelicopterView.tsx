import React from 'react';
import type { ExpenseRequest } from '../../types';
import { TrendingUp, CheckCircle2, Banknote, DollarSign } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { formatRp } from '../../utils/currency';

interface HelicopterViewProps {
  expenses: ExpenseRequest[];
  budget?: number;
}

const HelicopterView: React.FC<HelicopterViewProps> = ({ expenses, budget }) => {
  const { t } = useTranslation();

  const grossExposure = expenses
    .filter(e => ['processing', 'approved', 'scheduled'].includes(e.status))
    .reduce((sum, e) => sum + e.totalAmount, 0);

  const confirmedLiability = expenses
    .filter(e => ['approved', 'scheduled'].includes(e.status))
    .reduce((sum, e) => sum + e.totalAmount, 0);

  const disbursed = expenses
    .filter(e => e.status === 'reimbursed')
    .reduce((sum, e) => sum + e.totalAmount, 0);

  const budgetUsed = budget ? ((disbursed + confirmedLiability) / budget) * 100 : null;

  const metrics = [
    {
      label: t.helicopter.grossExposure,
      value: grossExposure,
      icon: <TrendingUp size={18} />,
      description: t.helicopter.grossDesc,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: t.helicopter.confirmedLiability,
      value: confirmedLiability,
      icon: <CheckCircle2 size={18} />,
      description: t.helicopter.confirmedDesc,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: t.helicopter.disbursed,
      value: disbursed,
      icon: <Banknote size={18} />,
      description: t.helicopter.disbursedDesc,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`bg-white border ${m.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{m.label}</span>
              <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center ${m.color}`}>
                {m.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${m.color}`}>
              {formatRp(m.value)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{m.description}</p>
          </div>
        ))}
      </div>

      {budget && budgetUsed !== null && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{t.helicopter.budgetUtilization}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">
              {formatRp(disbursed + confirmedLiability)} / {formatRp(budget)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                budgetUsed > 90 ? 'bg-rose-500' : budgetUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{budgetUsed.toFixed(1)}% {t.helicopter.ofBudget}</p>
        </div>
      )}
    </div>
  );
};

export default HelicopterView;
