import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import { formatRp } from '../utils/currency';
import MetricCard from '../components/dashboard/MetricCard';
import ExpenseCard from '../components/expenses/ExpenseCard';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, FolderOpen, ChevronRight } from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';
import Avatar from '../components/ui/Avatar';


const DashboardPage: React.FC = () => {
  const { currentUser, expenses, projects, users } = useAppStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // ── USER DASHBOARD ──────────────────────────────────────────────────────────
  if (currentUser.role === 'user') {
    const myExpenses = expenses.filter(e => e.userId === currentUser.id);
    const totalRequested = myExpenses.reduce((s, e) => s + e.totalAmount, 0);
    const totalApproved = myExpenses.filter(e => ['approved', 'scheduled', 'reimbursed'].includes(e.status))
      .reduce((s, e) => s + e.totalAmount, 0);
    const totalReimbursed = myExpenses.filter(e => e.status === 'reimbursed').reduce((s, e) => s + e.totalAmount, 0);
    const pendingRevisions = myExpenses.filter(e => e.status === 'revision');
    const recent = myExpenses.slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.welcome}, {currentUser.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s a summary of your expense activity.</p>
        </div>

        {/* Revision alerts */}
        {pendingRevisions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">{t.dashboard.actionRequired} {pendingRevisions.length > 1 ? t.dashboard.revisionsNeeded : ''}</h3>
            </div>
            <div className="space-y-2">
              {pendingRevisions.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => navigate(`/expenses/${exp.id}`)}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 cursor-pointer hover:border-amber-300 border border-amber-100 transition-colors group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700">{exp.requestId}</span>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {exp.auditTrail.filter(a => a.action === 'Revision Requested').at(-1)?.comment || 'Revision requested by admin.'}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label={t.dashboard.totalRequested}
            value={formatRp(totalRequested)}
            subValue={`${myExpenses.length} ${t.dashboard.requests}`}
            icon={<DollarSign size={20} />}
            color="indigo"
          />
          <MetricCard
            label={t.dashboard.totalApproved}
            value={formatRp(totalApproved)}
            subValue={`${myExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).length} ${t.dashboard.requests}`}
            icon={<CheckCircle2 size={20} />}
            color="emerald"
          />
          <MetricCard
            label={t.dashboard.totalReimbursed}
            value={formatRp(totalReimbursed)}
            subValue={`${myExpenses.filter(e => e.status === 'reimbursed').length} ${t.dashboard.paidOut}`}
            icon={<TrendingUp size={20} />}
            color="violet"
          />
        </div>

        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">{t.dashboard.recentExpenses}</h2>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{t.actions.viewAll}</button>
          </div>
          {recent.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-slate-400 text-sm">{t.dashboard.noExpenses}</p>
              <button onClick={() => navigate('/submit')} className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800">{t.dashboard.submitFirst}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(e => <ExpenseCard key={e.id} expense={e} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
  if (currentUser.role === 'admin') {
    const adminProjects = projects.filter(p => p.adminId === currentUser.id);
    const adminProjectIds = adminProjects.map(p => p.id);
    const scopedExpenses = expenses.filter(e => adminProjectIds.includes(e.projectId));
    const pendingApprovals = scopedExpenses.filter(e => e.status === 'processing');
    const recentActivity = scopedExpenses.slice(0, 6);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.adminDashboard}</h1>
          <p className="text-slate-500 text-sm mt-1">{t.dashboard.adminDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label={t.dashboard.pendingApprovals} value={pendingApprovals.length} icon={<Clock size={20} />} color="amber" />
          <MetricCard label={t.dashboard.activeProjects} value={adminProjects.filter(p => p.status === 'active').length} icon={<FolderOpen size={20} />} color="indigo" />
          <MetricCard
            label={t.dashboard.totalCommitted}
            value={formatRp(scopedExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).reduce((s,e)=>s+e.totalAmount,0))}
            icon={<CheckCircle2 size={20} />}
            color="emerald"
          />
          <MetricCard label={t.dashboard.teamMembers} value={adminProjects.flatMap(p=>p.assignedUserIds).filter((v,i,a)=>a.indexOf(v)===i).length} icon={<Users size={20} />} color="violet" />
        </div>

        {/* Pending approvals */}
        {pendingApprovals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">{t.dashboard.pendingApprovals}</h2>
              <button onClick={() => navigate('/expenses?status=processing')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{t.actions.viewAll}</button>
            </div>
            <div className="space-y-3">
              {pendingApprovals.slice(0, 4).map(e => <ExpenseCard key={e.id} expense={e} />)}
            </div>
          </div>
        )}

        {/* Projects overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">{t.dashboard.yourProjects}</h2>
            <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{t.actions.viewAll}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminProjects.map(project => {
              const projExpenses = expenses.filter(e => e.projectId === project.id);
              return (
                <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>{projExpenses.filter(e=>e.status==='processing').length} {t.dashboard.pending}</span>
                    <span>{projExpenses.filter(e=>e.status==='approved').length} {t.dashboard.approved}</span>
                    <span>{projExpenses.length} {t.dashboard.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">{t.dashboard.teamActivity}</h2>
          <div className="space-y-3">
            {recentActivity.map(e => <ExpenseCard key={e.id} expense={e} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── SUPER ADMIN DASHBOARD ───────────────────────────────────────────────────
  const totalExposure = expenses.filter(e => ['processing','approved','scheduled'].includes(e.status)).reduce((s,e)=>s+e.totalAmount,0);
  const confirmedLiability = expenses.filter(e => ['approved','scheduled'].includes(e.status)).reduce((s,e)=>s+e.totalAmount,0);
  const disbursed = expenses.filter(e => e.status === 'reimbursed').reduce((s,e)=>s+e.totalAmount,0);
  const pendingCount = expenses.filter(e => e.status === 'processing').length;
  const scheduledCount = expenses.filter(e => e.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.globalOverview}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.dashboard.globalDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t.dashboard.grossExposure} value={formatRp(totalExposure)} subValue={t.metrics.processingApprovedScheduled} icon={<TrendingUp size={20} />} color="amber" />
        <MetricCard label={t.dashboard.confirmedLiability} value={formatRp(confirmedLiability)} subValue={t.metrics.approvedScheduled} icon={<CheckCircle2 size={20} />} color="emerald" />
        <MetricCard label={t.dashboard.totalDisbursed} value={formatRp(disbursed)} subValue={`${expenses.filter(e=>e.status==='reimbursed').length} ${t.metrics.reimbursed}`} icon={<DollarSign size={20} />} color="indigo" />
        <MetricCard label={t.dashboard.pendingReview} value={pendingCount} subValue={`${scheduledCount} ${t.dashboard.awaitingPayment}`} icon={<Clock size={20} />} color="rose" />
      </div>

      {/* Status breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-4">{t.dashboard.statusBreakdown}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['processing','approved','rejected','revision','scheduled','reimbursed'] as const).map(status => {
            const count = expenses.filter(e=>e.status===status).length;
            return (
              <button
                key={status}
                onClick={() => navigate(`/expenses?status=${status}`)}
                className="flex flex-col items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-xl font-bold text-slate-800">{count}</span>
                <StatusPill status={status} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">{t.dashboard.recentSubmissions}</h2>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{t.actions.viewAll}</button>
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(e => <ExpenseCard key={e.id} expense={e} />)}
          </div>
        </div>

        {/* Top users */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">{t.dashboard.teamActivity}</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {users.filter(u=>u.role==='user').map((u, i) => {
              const userExpenses = expenses.filter(e=>e.userId===u.id);
              const total = userExpenses.reduce((s,e)=>s+e.totalAmount,0);
              return (
                <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i>0?'border-t border-slate-50':''}`}>
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">{formatRp(total)}</p>
                    <p className="text-xs text-slate-400">{userExpenses.length} {t.dashboard.requests}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
