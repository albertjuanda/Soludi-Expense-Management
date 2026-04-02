import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  BarChart2,
  Users,
  Settings,
  PlusCircle,
  ChevronRight,
  Briefcase,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Avatar from '../ui/Avatar';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['super_admin', 'admin', 'user'] },
  { to: '/expenses', icon: <FileText size={18} />, label: 'Expenses', roles: ['super_admin', 'admin', 'user'] },
  { to: '/submit', icon: <PlusCircle size={18} />, label: 'Submit Expense', roles: ['user', 'admin'] },
  { to: '/projects', icon: <FolderOpen size={18} />, label: 'Projects', roles: ['super_admin', 'admin', 'user'] },
  { to: '/reports', icon: <BarChart2 size={18} />, label: 'Reports', roles: ['super_admin', 'admin'] },
  { to: '/users', icon: <Users size={18} />, label: 'Users', roles: ['super_admin'] },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings', roles: ['super_admin'] },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'Team Member',
};

const Sidebar: React.FC = () => {
  const { currentUser, sidebarOpen, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Soludi</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {filteredNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={14} className="text-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
            <Avatar name={currentUser.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{roleLabels[currentUser.role]}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
