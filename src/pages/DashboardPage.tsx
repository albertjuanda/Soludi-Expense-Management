import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import MetricCard from '../components/dashboard/MetricCard';
import ExpenseCard from '../components/expenses/ExpenseCard';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, FolderOpen, ChevronRight } from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';
import Avatar from '../components/ui/Avatar';


const DashboardPage: React.FC = () => {
  const { currentUser, expenses, projects, users } = useAppStore();
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
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's a summary of your expense activity.</p>
        </div>

        {/* Revision alerts */}
        {pendingRevisions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">Action Required — Revision{pendingRevisions.length > 1 ? 's' : ''} Needed</h3>
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
            label="Total Requested"
            value={`$${totalRequested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subValue={`${myExpenses.length} requests`}
            icon={<DollarSign size={20} />}
            color="indigo"
          />
          <MetricCard
            label="Total Approved"
            value={`$${totalApproved.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subValue={`${myExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).length} requests`}
            icon={<CheckCircle2 size={20} />}
            color="emerald"
          />
          <MetricCard
            label="Total Reimbursed"
            value={`$${totalReimbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subValue={`${myExpenses.filter(e => e.status === 'reimbursed').length} paid out`}
            icon={<TrendingUp size={20} />}
            color="violet"
          />
        </div>

        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Recent Expenses</h2>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
          </div>
          {recent.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-slate-400 text-sm">No expenses yet.</p>
              <button onClick={() => navigate('/submit')} className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800">Submit your first expense →</button>
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
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your projects and pending approvals.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Pending Approvals" value={pendingApprovals.length} icon={<Clock size={20} />} color="amber" />
          <MetricCard label="Active Projects" value={adminProjects.filter(p => p.status === 'active').length} icon={<FolderOpen size={20} />} color="indigo" />
          <MetricCard
            label="Total Committed"
            value={`$${scopedExpenses.filter(e => ['approved','scheduled','reimbursed'].includes(e.status)).reduce((s,e)=>s+e.totalAmount,0).toLocaleString('en-US',{minimumFractionDigits:2})}`}
            icon={<CheckCircle2 size={20} />}
            color="emerald"
          />
          <MetricCard label="Team Members" value={adminProjects.flatMap(p=>p.assignedUserIds).filter((v,i,a)=>a.indexOf(v)===i).length} icon={<Users size={20} />} color="violet" />
        </div>

        {/* Pending approvals */}
        {pendingApprovals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">Pending Approvals</h2>
              <button onClick={() => navigate('/expenses?status=processing')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
            </div>
            <div className="space-y-3">
              {pendingApprovals.slice(0, 4).map(e => <ExpenseCard key={e.id} expense={e} />)}
            </div>
          </div>
        )}

        {/* Projects overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Your Projects</h2>
            <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
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
                    <span>{projExpenses.filter(e=>e.status==='processing').length} pending</span>
                    <span>{projExpenses.filter(e=>e.status==='approved').length} approved</span>
                    <span>{projExpenses.length} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Recent Activity</h2>
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
        <h1 className="text-2xl font-bold text-slate-900">Global Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Company-wide expense management summary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Gross Exposure" value={`$${totalExposure.toLocaleString('en-US',{minimumFractionDigits:2})}`} subValue="Processing + Approved + Scheduled" icon={<TrendingUp size={20} />} color="amber" />
        <MetricCard label="Confirmed Liability" value={`$${confirmedLiability.toLocaleString('en-US',{minimumFractionDigits:2})}`} subValue="Approved + Scheduled" icon={<CheckCircle2 size={20} />} color="emerald" />
        <MetricCard label="Total Disbursed" value={`$${disbursed.toLocaleString('en-US',{minimumFractionDigits:2})}`} subValue={`${expenses.filter(e=>e.status==='reimbursed').length} reimbursed`} icon={<DollarSign size={20} />} color="indigo" />
        <MetricCard label="Pending Review" value={pendingCount} subValue={`${scheduledCount} scheduled for payment`} icon={<Clock size={20} />} color="rose" />
      </div>

      {/* Status breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Status Breakdown</h2>
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
            <h2 className="text-base font-bold text-slate-800">Recent Submissions</h2>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(e => <ExpenseCard key={e.id} expense={e} />)}
          </div>
        </div>

        {/* Top users */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Team Activity</h2>
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
                    <p className="text-xs font-bold text-slate-700">${total.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                    <p className="text-xs text-slate-400">{userExpenses.length} requests</p>
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
