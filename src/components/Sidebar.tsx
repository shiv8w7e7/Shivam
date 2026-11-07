import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Upload,
  Search,
  History,
  Award,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from './Logo';
import { ExamAttempt } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAttempt: ExamAttempt | null;
  isAdmin: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAttempt,
  isAdmin,
  onCloseMobileMenu,
}) => {
  const handleNav = (tab: string) => {
    onSelectTab(tab);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tests', label: 'Model Papers Hub', icon: FileText },
    {
      id: 'active_exam',
      label: 'Live Exam Hall',
      icon: Clock,
      badge: activeAttempt && activeAttempt.status === 'in_progress' ? 'LIVE' : null,
      badgeColor: 'bg-orange-500 text-white animate-pulse',
    },
    {
      id: 'upload',
      label: 'Upload Notebook',
      icon: Upload,
      badge: activeAttempt && activeAttempt.status === 'upload_window' ? '7 MIN' : null,
      badgeColor: 'bg-rose-600 text-white animate-bounce',
    },
    { id: 'results', label: 'Result Checker', icon: Search },
    { id: 'history', label: 'Exam Transcripts', icon: History },
    { id: 'solution', label: 'Marking Scheme', icon: Award },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Desk',
      icon: ShieldCheck,
      badge: 'PRO',
      badgeColor: 'bg-slate-900 dark:bg-orange-600 text-orange-400 dark:text-white',
    });
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-full shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Logo size="md" showTagline={false} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2.5">
          Examination Desk
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                isActive
                  ? 'bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold border border-orange-200/80 dark:border-orange-900/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Exam Status Card in Sidebar */}
      {activeAttempt && (activeAttempt.status === 'in_progress' || activeAttempt.status === 'upload_window') && (
        <div className="mx-3 my-2 p-3.5 bg-gradient-to-br from-orange-50/80 to-amber-50/40 dark:from-slate-800 dark:to-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 text-[10px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
            <span>{activeAttempt.status === 'in_progress' ? 'EXAM IN PROGRESS' : 'UPLOAD WINDOW OPEN'}</span>
          </div>
          <div className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-mono font-black text-slate-900 dark:text-white text-sm tracking-wide">
              {activeAttempt.rollNumber}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {activeAttempt.subjectName}
            </div>
          </div>
          <button
            onClick={() => handleNav(activeAttempt.status === 'in_progress' ? 'active_exam' : 'upload')}
            className="mt-3 w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition-all active:scale-98"
          >
            {activeAttempt.status === 'in_progress' ? 'Resume Exam Hall' : 'Upload Notebook'}
          </button>
        </div>
      )}

      {/* Sidebar Footer: Developer Credit & Tagline */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            UP Board Class 10 & 12
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-snug">
          &ldquo;Practice Like Board. Perform Like Topper.&rdquo;
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Developed by <strong className="text-orange-600 dark:text-orange-400 font-bold">Shivam</strong>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            UPMSP
          </span>
        </div>
      </div>
    </aside>
  );
};
