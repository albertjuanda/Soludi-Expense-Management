import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import Layout from './components/layout/Layout';

import DashboardPage from './pages/DashboardPage';
import SubmitExpensePage from './pages/SubmitExpensePage';
import ExpensesPage from './pages/ExpensesPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

import Avatar from './components/ui/Avatar';
import { ChevronUp, ChevronDown, Users } from 'lucide-react';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'Team Member',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-violet-100 text-violet-700',
  admin: 'bg-indigo-100 text-indigo-700',
  user: 'bg-slate-100 text-slate-600',
};

const DemoSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useAppStore();
  const [open, setOpen] = useState(false);

  const demoUsers = [
    users.find(u => u.id === 'usr-001')!, // Sarah Chen - super_admin
    users.find(u => u.id === 'usr-002')!, // Marcus Rivera - admin
    users.find(u => u.id === 'usr-004')!, // Jake Thompson - user
    users.find(u => u.id === 'usr-005')!, // Emma Wilson - user
  ].filter(Boolean);

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-64">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-500" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Demo — Switch Role</p>
            </div>
          </div>
          <div className="py-1">
            {demoUsers.map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${currentUser.id === u.id ? 'bg-indigo-50' : ''}`}
              >
                <Avatar name={u.name} size="sm" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${roleColors[u.role]}`}>
                    {roleLabels[u.role]}
                  </span>
                </div>
                {currentUser.id === u.id && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm font-semibold text-slate-700"
      >
        <Avatar name={currentUser.name} size="xs" />
        <span className="hidden sm:block">{currentUser.name.split(' ')[0]}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</span>
        {open ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronUp size={13} className="text-slate-400" />}
      </button>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/dashboard" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/Soludi-Expense-Management">
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/submit" element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <SubmitExpensePage />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
      <DemoSwitcher />
    </BrowserRouter>
  );
};

export default App;
