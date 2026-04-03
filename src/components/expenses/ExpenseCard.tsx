import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExpenseRequest } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../i18n/useTranslation';
import StatusPill from '../ui/StatusPill';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';
import { ChevronRight, Receipt } from 'lucide-react';
import { formatRp } from '../../utils/currency';

interface ExpenseCardProps {
  expense: ExpenseRequest;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const { users, projects } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = users.find(u => u.id === expense.userId);
  const project = projects.find(p => p.id === expense.projectId);

  return (
    <div
      onClick={() => navigate(`/expenses/${expense.id}`)}
      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
            <Receipt size={16} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800">{expense.requestId}</span>
              <StatusPill status={expense.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {project?.name || 'Unknown Project'}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-slate-900">{formatRp(expense.totalAmount)}</p>
          <p className="text-xs text-slate-400">{expense.items.length} {expense.items.length !== 1 ? t.expenses.itemsPlural : t.expenses.items}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2">
          {user && <Avatar name={user.name} size="xs" />}
          <span className="text-xs text-slate-500">{user?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {format(new Date(expense.createdAt), 'MMM d, yyyy')}
          </span>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
