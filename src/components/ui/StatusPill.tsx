import React from 'react';
import type { ExpenseStatus } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

interface StatusPillProps {
  status: ExpenseStatus;
  size?: 'sm' | 'md';
}

const statusClasses: Record<ExpenseStatus, string> = {
  processing: 'bg-amber-100 text-amber-800 border border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border border-rose-200',
  revision: 'bg-orange-100 text-orange-800 border border-orange-200',
  scheduled: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  reimbursed: 'bg-green-100 text-green-900 border border-green-200',
};

const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();
  const classes = statusClasses[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClasses} ${classes}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {t.status[status]}
    </span>
  );
};

export default StatusPill;
