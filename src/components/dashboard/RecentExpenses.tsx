import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExpenseRequest } from '../../types';
import { useAppStore } from '../../store/appStore';
import StatusPill from '../ui/StatusPill';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { formatRp } from '../../utils/currency';

interface RecentExpensesProps {
  expenses: ExpenseRequest[];
  limit?: number;
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses, limit = 5 }) => {
  const { users, projects } = useAppStore();
  const navigate = useNavigate();

  const displayed = expenses.slice(0, limit);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Recent Expenses</h3>
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>
      {displayed.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No recent expenses</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {displayed.map(expense => {
            const user = users.find(u => u.id === expense.userId);
            const project = projects.find(p => p.id === expense.projectId);
            return (
              <div
                key={expense.id}
                onClick={() => navigate(`/expenses/${expense.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Avatar name={user?.name || '?'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{expense.requestId}</span>
                    <StatusPill status={expense.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{project?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">{formatRp(expense.totalAmount)}</p>
                  <p className="text-xs text-slate-400">{format(new Date(expense.createdAt), 'MMM d')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
