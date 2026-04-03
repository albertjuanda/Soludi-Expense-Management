import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { CalendarClock, CheckCircle2, Banknote, ChevronDown } from 'lucide-react';
import StatusPill from '../ui/StatusPill';
import { format } from 'date-fns';
import { useTranslation } from '../../i18n/useTranslation';
import { formatRp } from '../../utils/currency';

const BulkReimbursement: React.FC = () => {
  const { expenses, users, projects, schedule, updateSchedule, bulkMarkReimbursed } = useAppStore();
  const { t } = useTranslation();
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  const scheduledExpenses = expenses.filter(e => e.status === 'scheduled');
  const totalAmount = scheduledExpenses
    .filter(e => selectedIds.has(e.id))
    .reduce((sum, e) => sum + e.totalAmount, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === scheduledExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scheduledExpenses.map(e => e.id)));
    }
  };

  const handleMarkPaid = () => {
    if (selectedIds.size === 0) return;
    bulkMarkReimbursed([...selectedIds]);
    setSelectedIds(new Set());
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Schedule Settings */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <CalendarClock size={16} className="text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">{t.bulk.paymentSchedule}</p>
              <p className="text-xs text-slate-500 capitalize">
                {schedule.frequency} · {t.bulk.next}: {format(new Date(schedule.nextPaymentDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${schedule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {schedule.isActive ? t.bulk.active : t.bulk.inactive}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showSchedule && (
          <div className="px-5 pb-5 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.bulk.frequency}</label>
                <select
                  value={schedule.frequency}
                  onChange={e => updateSchedule({ frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                >
                  <option value="weekly">{t.bulk.weekly}</option>
                  <option value="biweekly">{t.bulk.biweekly}</option>
                  <option value="monthly">{t.bulk.monthly}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.bulk.nextPaymentDate}</label>
                <input
                  type="date"
                  value={schedule.nextPaymentDate}
                  onChange={e => updateSchedule({ nextPaymentDate: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.isActive}
                    onChange={e => updateSchedule({ isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm text-slate-600">{t.bulk.scheduleActive}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk payment */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">{t.bulk.scheduledForPayment}</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
              {scheduledExpenses.length}
            </span>
          </div>
          {scheduledExpenses.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {selectedIds.size === scheduledExpenses.length ? t.bulk.deselectAll : t.bulk.selectAll}
            </button>
          )}
        </div>

        {confirmed && (
          <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {t.bulk.paymentProcessed}
          </div>
        )}

        {scheduledExpenses.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">{t.bulk.noScheduled}</p>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {scheduledExpenses.map(expense => {
                const user = users.find(u => u.id === expense.userId);
                const project = projects.find(p => p.id === expense.projectId);
                const isSelected = selectedIds.has(expense.id);

                return (
                  <div
                    key={expense.id}
                    onClick={() => toggleSelect(expense.id)}
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(expense.id)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{expense.requestId}</span>
                        <StatusPill status={expense.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.name} · {project?.name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {formatRp(expense.totalAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {selectedIds.size > 0 && (
                  <span>
                    <span className="font-bold text-slate-800">{selectedIds.size}</span> {t.bulk.selected} ·{' '}
                    <span className="font-bold text-indigo-700">{formatRp(totalAmount)}</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleMarkPaid}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Banknote size={16} />
                {t.actions.markAsPaid}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkReimbursement;
