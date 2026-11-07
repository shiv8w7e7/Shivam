import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Search,
  MoreHorizontal,
  Upload,
} from 'lucide-react';
import { ExamAttempt } from '../types';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAttempt: ExamAttempt | null;
  onOpenMoreMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeAttempt,
  onOpenMoreMenu,
}) => {
  // During an active exam hall session or upload window, hide the generic bottom nav
  // so the student has an unobstructed view of the timer and sticky submit button!
  if (currentTab === 'active_exam' || currentTab === 'upload') {
    return null;
  }

  const hasLiveExam = activeAttempt && activeAttempt.status === 'in_progress';
  const hasLiveUpload = activeAttempt && activeAttempt.status === 'upload_window';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-2 safe-area-pb shadow-lg transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] ${
            currentTab === 'dashboard'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* Tests */}
        <button
          onClick={() => onSelectTab('tests')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] ${
            currentTab === 'tests'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Papers</span>
        </button>

        {/* Live Exam or Upload indicator */}
        {hasLiveUpload ? (
          <button
            onClick={() => onSelectTab('upload')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-rose-600 font-bold relative animate-bounce min-h-[44px]"
          >
            <Upload className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Upload</span>
            <span className="absolute top-1 right-2 w-2 h-2 bg-rose-600 rounded-full" />
          </button>
        ) : hasLiveExam ? (
          <button
            onClick={() => onSelectTab('active_exam')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-orange-600 dark:text-orange-400 font-bold relative min-h-[44px]"
          >
            <Clock className="w-5 h-5 mb-0.5 text-orange-600 animate-pulse" />
            <span className="text-[10px] tracking-tight">Live Hall</span>
            <span className="absolute top-1 right-2 w-2 h-2 bg-orange-600 rounded-full animate-ping" />
          </button>
        ) : null}

        {/* Results */}
        <button
          onClick={() => onSelectTab('results')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-h-[44px] ${
            currentTab === 'results'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Results</span>
        </button>

        {/* More */}
        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all min-h-[44px]"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
