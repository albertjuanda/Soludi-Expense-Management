import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, Check, ExternalLink, Globe } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Avatar from '../ui/Avatar';
import SearchBar from '../ui/SearchBar';
import { useTranslation } from '../../i18n/useTranslation';
import { formatDistanceToNow } from 'date-fns';

const Header: React.FC = () => {
  const { currentUser, notifications, setSidebarOpen, markNotificationRead, markAllNotificationsRead, language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder={t.expenses.searchPlaceholder}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
        >
          <Globe size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700 transition-colors tracking-wide">
            {language === 'en' ? 'EN' : 'ID'}
          </span>
          <span className="text-xs text-slate-300 group-hover:text-indigo-300 transition-colors">/</span>
          <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
            {language === 'en' ? 'ID' : 'EN'}
          </span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">{t.notifications.title}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <Check size={12} />
                    {t.notifications.markAllRead}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">{t.notifications.noNotifications}</p>
                ) : (
                  userNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) { navigate(n.link); setShowNotifs(false); }
                      }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${!n.read ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                        <div className={!n.read ? '' : 'ml-3.5'}>
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {n.link && <ExternalLink size={12} className="text-slate-300 ml-auto flex-shrink-0 mt-0.5" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Avatar name={currentUser.name} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name.split(' ')[0]}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {t.nav.settings}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
