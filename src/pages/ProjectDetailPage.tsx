import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../i18n/useTranslation';
import HelicopterView from '../components/projects/HelicopterView';
import ExpenseCard from '../components/expenses/ExpenseCard';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { ArrowLeft, Calendar, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

const statusClasses: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  on_hold: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, users, expenses } = useAppStore();
  const { t } = useTranslation();

  const statusLabels: Record<string, string> = {
    active: t.projects.active,
    completed: t.projects.completed,
    on_hold: t.projects.onHold,
    cancelled: t.projects.cancelled,
  };

  const project = projects.find(p => p.id === id);
  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-slate-500">Project not found.</p>
      <button onClick={() => navigate('/projects')} className="mt-4 text-indigo-600 font-semibold text-sm">← {t.actions.back}</button>
    </div>
  );

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const assignedUsers = users.filter(u => project.assignedUserIds.includes(u.id));
  const admin = users.find(u => u.id === project.adminId);
  const classes = statusClasses[project.status] || statusClasses.active;
  const statusLabel = statusLabels[project.status] || project.status;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <ArrowLeft size={16} /> {t.actions.back}
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{project.description}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${classes}`}>{statusLabel}</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{format(new Date(project.startDate), 'MMM d, yyyy')} – {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
          </div>
          {admin && (
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>{t.projects.admin}: <span className="font-semibold text-slate-700">{admin.name}</span></span>
            </div>
          )}
          {project.budget && (
            <div className="text-sm">
              Budget: <span className="font-semibold text-slate-700">${project.budget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Financial overview */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">{t.projects.financialOverview}</h2>
        <HelicopterView expenses={projectExpenses} budget={project.budget} />
      </div>

      {/* Team */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-4">{t.projects.assignedTeam} ({assignedUsers.length})</h2>
        {assignedUsers.length === 0 ? (
          <p className="text-sm text-slate-400">{t.projects.noTeamMembers}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {assignedUsers.map(u => (
              <div key={u.id} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Avatar name={u.name} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.department}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">{t.projects.expenseRequests} ({projectExpenses.length})</h2>
        </div>
        {projectExpenses.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} className="text-slate-300" />}
            title={t.projects.noExpensesYet}
            description={t.projects.noExpensesYet}
          />
        ) : (
          <div className="space-y-3">
            {projectExpenses.map(e => <ExpenseCard key={e.id} expense={e} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
