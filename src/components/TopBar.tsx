import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Shield,
  Menu,
  X,
  Clock,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ExamAttempt, UserProfile } from '../types';

interface TopBarProps {
  currentTab: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeAttempt: ExamAttempt | null;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onReplaySplash?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  theme,
  onToggleTheme,
  activeAttempt,
  isAdmin,
  onToggleAdmin,
  onOpenMobileMenu,
  isMobileMenuOpen,
  userProfile,
  onOpenProfile,
  onReplaySplash,
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());
  const [rollCopied, setRollCopied] = useState<boolean>(false);

  // Live Asia/Kolkata Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setIstTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  const handleTestBell = () => {
    soundManager.playBrassBell('single');
  };

  const handleCopyRoll = () => {
    if (activeAttempt?.rollNumber) {
      navigator.clipboard.writeText(activeAttempt.rollNumber);
      setRollCopied(true);
      setTimeout(() => setRollCopied(false), 2000);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Student Examination Portal';
      case 'tests':
        return 'Model Paper Practice Hub';
      case 'active_exam':
        return 'Live Examination Hall & Timer';
      case 'upload':
        return 'Handwritten Copy Submission Window';
      case 'results':
        return 'Official UP Board Result Verification';
      case 'history':
        return 'Candidate Exam History & Transcripts';
      case 'solution':
        return 'Model Answer Keys & Marking Scheme';
      case 'admin':
        return 'ShiTest Authority & Moderation Console';
      default:
        return 'ShiTest';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left side: Mobile menu toggle + Hierarchical Breadcrumb & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="min-w-0">
            {/* Unboxed breadcrumb without pill enclosure */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              <span>ShiTest</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold tracking-wide uppercase text-[10px] font-mono">
                UP Board Class {userProfile.classLevel}th
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Active Exam Roll Status Bar (when exam in progress) */}
        {activeAttempt && (activeAttempt.status === 'in_progress' || activeAttempt.status === 'upload_window') && (
          <div className="hidden md:flex items-center gap-2.5 bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-850 px-3.5 py-1.5 rounded-xl text-xs shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">Active Roll:</span>
            <span className="font-mono font-black text-orange-950 dark:text-orange-300 tracking-wider text-xs">
              {activeAttempt.rollNumber}
            </span>
            <button
              onClick={handleCopyRoll}
              title="Copy Roll Number"
              className="text-orange-700 dark:text-orange-400 hover:text-orange-950 dark:hover:text-white p-1 rounded-md transition-colors"
            >
              {rollCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Right side controls: Live IST, Bell Sound, Dark/Light, Profile, Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Asia/Kolkata Clock */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-slate-200/80 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{istTime || 'IST'}</span>
          </div>

          {/* 3D Intro replay button */}
          {onReplaySplash && (
            <button
              onClick={onReplaySplash}
              title="Replay 3D Intro Animation"
              className="hidden sm:inline-flex p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
            </button>
          )}

          {/* Bell Chime Sound Controls */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Bell Chimes' : 'Mute Bell Chimes'}
              className={`p-1.5 rounded-lg transition-colors ${
                isMuted
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleTestBell}
              title="Test Brass Bell Sound"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Bell className="w-3 h-3 text-orange-600" />
              <span>Bell</span>
            </button>
          </div>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Candidate Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            title="Candidate Profile & Goals"
            className="flex items-center gap-2 p-1 pl-1.5 sm:pr-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all shadow-2xs active:scale-98"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-orange-500 bg-slate-100 shrink-0">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline text-xs font-semibold max-w-[95px] truncate">
              {userProfile.name}
            </span>
          </button>

          {/* Admin Switch */}
          <button
            onClick={onToggleAdmin}
            title={isAdmin ? 'Active as Admin (Shivam)' : 'Switch to Admin Console'}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs min-h-[38px] min-w-[38px] flex items-center justify-center ${
              isAdmin
                ? 'bg-slate-900 dark:bg-orange-600 text-white border-slate-900 dark:border-orange-600'
                : 'bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className={`w-4 h-4 ${isAdmin ? 'text-orange-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

