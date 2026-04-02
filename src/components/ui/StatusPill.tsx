import React from 'react';
import type { ExpenseStatus } from '../../types';

interface StatusPillProps {
  status: ExpenseStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ExpenseStatus, { label: string; classes: string }> = {
  processing: {
    label: 'Processing',
    classes: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-rose-100 text-rose-800 border border-rose-200',
  },
  revision: {
    label: 'Needs Revision',
    classes: 'bg-orange-100 text-orange-800 border border-orange-200',
  },
  scheduled: {
    label: 'Scheduled',
    classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  },
  reimbursed: {
    label: 'Reimbursed',
    classes: 'bg-green-100 text-green-900 border border-green-200',
  },
};

const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClasses} ${config.classes}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
};

export default StatusPill;
