import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import CategoryChart from '../components/reports/CategoryChart';
import BulkReimbursement from '../components/reports/BulkReimbursement';
import MetricCard from '../components/dashboard/MetricCard';
import { TrendingUp, CheckCircle2, DollarSign, Clock, Download, BarChart2 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { expenses, projects, users } = useAppStore();
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const filteredExpenses = expenses.filter(e => {
    if (selectedProject && e.projectId !== selectedProject) return false;
    if (dateFrom && new Date(e.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(e.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const totalRequested = filteredExpenses.reduce((s, e) => s + e.totalAmount, 0);
  const totalApproved = filteredExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).reduce((s,e) => s+e.totalAmount, 0);
  const totalReimbursed = filteredExpenses.filter(e => e.status === 'reimbursed').reduce((s,e) => s+e.totalAmount, 0);
  const pendingCount = filteredExpenses.filter(e => e.status === 'processing').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.reports.title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.reports.description}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
          <Download size={15} /> {t.actions.export}
        </button>
      </div>

      {/* Date/project filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenses.project}</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
              <option value="">{t.expenses.allProjects}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenses.fromDate}</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.expenses.toDate}</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t.dashboard.totalRequested} value={`$${totalRequested.toLocaleString('en-US',{minimumFractionDigits:2})}`} subValue={`${filteredExpenses.length} ${t.dashboard.requests}`} icon={<TrendingUp size={20} />} color="amber" />
        <MetricCard label={t.dashboard.totalApproved} value={`$${totalApproved.toLocaleString('en-US',{minimumFractionDigits:2})}`} icon={<CheckCircle2 size={20} />} color="emerald" />
        <MetricCard label={t.dashboard.totalReimbursed} value={`$${totalReimbursed.toLocaleString('en-US',{minimumFractionDigits:2})}`} icon={<DollarSign size={20} />} color="indigo" />
        <MetricCard label={t.dashboard.pendingReview} value={pendingCount} subValue={t.metrics.awaitingApproval} icon={<Clock size={20} />} color="rose" />
      </div>

      {/* Charts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">{t.reports.spendingByCategory}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.reports.spendingDesc}</p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setChartType('donut')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${chartType === 'donut' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Donut
            </button>
            <button onClick={() => setChartType('bar')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${chartType === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BarChart2 size={12} /> Bar
            </button>
          </div>
        </div>
        <CategoryChart expenses={filteredExpenses} type={chartType} />
      </div>

      {/* Project breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">{t.reports.projectBreakdown}</h2>
        <div className="space-y-3">
          {projects.map(project => {
            const projExpenses = filteredExpenses.filter(e => e.projectId === project.id);
            const total = projExpenses.reduce((s,e) => s+e.totalAmount, 0);
            const approved = projExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).reduce((s,e) => s+e.totalAmount, 0);
            if (projExpenses.length === 0) return null;
            const pct = project.budget ? Math.min((approved / project.budget) * 100, 100) : null;
            return (
              <div key={project.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">{project.name}</h3>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">${total.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                    <p className="text-xs text-slate-400">{projExpenses.length} {t.dashboard.requests}</p>
                  </div>
                </div>
                {project.budget && pct !== null && (
                  <>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                      <div className={`h-1.5 rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">{pct.toFixed(1)}{t.reports.ofBudget} ${project.budget.toLocaleString()}</p>
                  </>
                )}
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  {(['processing','approved','rejected','scheduled','reimbursed'] as const).map(status => {
                    const count = projExpenses.filter(e => e.status === status).length;
                    if (!count) return null;
                    return <span key={status}>{count} {status}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">{t.reports.teamBreakdown}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.reports.member}</th>
                <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.reports.requests}</th>
                <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.reports.requested}</th>
                <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.status.approved}</th>
                <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.status.reimbursed}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.filter(u => u.role === 'user').map(u => {
                const ue = filteredExpenses.filter(e => e.userId === u.id);
                const req = ue.reduce((s,e) => s+e.totalAmount,0);
                const app = ue.filter(e=>['approved','scheduled','reimbursed'].includes(e.status)).reduce((s,e)=>s+e.totalAmount,0);
                const reimb = ue.filter(e=>e.status==='reimbursed').reduce((s,e)=>s+e.totalAmount,0);
                if (ue.length === 0) return null;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.department}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right text-slate-600">{ue.length}</td>
                    <td className="py-3 text-right font-medium text-slate-800">${req.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
                    <td className="py-3 text-right font-medium text-emerald-700">${app.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
                    <td className="py-3 text-right font-medium text-indigo-700">${reimb.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk reimbursement */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">{t.reports.bulkReimbursement}</h2>
        <BulkReimbursement />
      </div>
    </div>
  );
};

export default ReportsPage;
