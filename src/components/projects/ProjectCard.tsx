import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ExpenseRequest } from '../../types';
import { useAppStore } from '../../store/appStore';
import { Calendar, Users, ChevronRight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600' },
  on_hold: { label: 'On Hold', classes: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelled', classes: 'bg-rose-100 text-rose-700' },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { users, expenses } = useAppStore();
  const navigate = useNavigate();

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const totalSpent = projectExpenses
    .filter((e: ExpenseRequest) => ['approved', 'scheduled', 'reimbursed'].includes(e.status))
    .reduce((sum: number, e: ExpenseRequest) => sum + e.totalAmount, 0);

  const admin = users.find(u => u.id === project.adminId);
  const assignedUsers = users.filter(u => project.assignedUserIds.includes(u.id));
  const status = statusConfig[project.status] || statusConfig.active;

  const budgetPct = project.budget ? Math.min((totalSpent / project.budget) * 100, 100) : null;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>
            {status.label}
          </span>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{format(new Date(project.startDate), 'MMM d')} – {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users size={12} />
          <span>{assignedUsers.length} member{assignedUsers.length !== 1 ? 's' : ''}</span>
          {admin && <span className="text-slate-400">· Admin: {admin.name.split(' ')[0]}</span>}
        </div>
      </div>

      {project.budget && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1 text-slate-500">
              <DollarSign size={11} />
              <span>Budget</span>
            </div>
            <span className="font-semibold text-slate-700">
              ${totalSpent.toLocaleString()} / ${project.budget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            {budgetPct !== null && (
              <div
                className={`h-1.5 rounded-full ${
                  budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{projectExpenses.length}</span> expense{projectExpenses.length !== 1 ? 's' : ''}
        </div>
        <div className="text-xs font-semibold text-slate-700">
          ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} committed
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
