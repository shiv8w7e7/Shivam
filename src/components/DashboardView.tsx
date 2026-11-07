import React from 'react';
import {
  FileText,
  Clock,
  Hourglass,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Search,
  ChevronRight,
  FileCheck2,
  Target,
  Flame,
} from 'lucide-react';
import { ExamAttempt, UserProfile } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onStartRealBoardExam: () => void;
  activeAttempt: ExamAttempt | null;
  attempts: ExamAttempt[];
  onSelectAttemptForSolution: (attemptId: string) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onStartRealBoardExam,
  activeAttempt,
  attempts,
  onSelectAttemptForSolution,
  userProfile,
  onOpenProfile,
}) => {
  const testsTakenCount = attempts.length;
  const pendingCount = attempts.filter((a) => a.status === 'evaluating' || a.status === 'flagged').length;
  const releasedCount = attempts.filter((a) => a.status === 'released').length;

  const hasActiveExam = activeAttempt && (activeAttempt.status === 'in_progress' || activeAttempt.status === 'upload_window');

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8 px-1 sm:px-2">
      {/* CANDIDATE STUDY DESK & HERO CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all">
        {/* Subtle Architectural Ambient Corner Tint */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/8 via-amber-500/4 to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            {/* Candidate Avatar with Gold Precision Ring */}
            <button
              onClick={onOpenProfile}
              title="Edit Candidate Profile & Aspirations"
              className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500/80 shadow-md shrink-0 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded">Edit</span>
              </div>
            </button>

            <div className="space-y-1.5 min-w-0">
              {/* Unboxed Metadata Line (No Pill Enclosures) */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-orange-600 dark:text-orange-400 font-semibold tracking-wide">
                  UP Board Class {userProfile.classLevel}th
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>Session 2025–26</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>Target Score: {userProfile.targetScorePercent}%</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                Welcome back, {userProfile.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {userProfile.goalDescription || 'Practicing 3-hour 15-minute handwritten copy presentation under strict board conditions.'}
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0 w-full sm:w-auto">
            {hasActiveExam ? (
              <button
                onClick={() => onNavigate(activeAttempt.status === 'in_progress' ? 'active_exam' : 'upload')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all min-h-[48px]"
              >
                <Clock className="w-4 h-4 animate-spin" />
                <span>{activeAttempt.status === 'in_progress' ? 'Resume Live Exam Hall' : 'Open Upload Window'}</span>
              </button>
            ) : (
              <button
                onClick={onStartRealBoardExam}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all min-h-[48px]"
              >
                <span>Start Real Board Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all min-h-[48px] shadow-2xs"
            >
              <Target className="w-3.5 h-3.5 text-orange-500" />
              <span>Aspiration Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS — HIGH CONTRAST & CLEAN ARCHITECTURE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Tests Taken */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tests Attempted
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {testsTakenCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Class {userProfile.classLevel}th
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate">Handwritten practice ledger</div>
        </div>

        {/* Metric 2: Live Timer Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Exam
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              hasActiveExam ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {hasActiveExam ? '1' : '0'}
            </span>
            {hasActiveExam && (
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 animate-pulse">
                IN PROGRESS
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate font-mono">
            {hasActiveExam ? `Roll: ${activeAttempt.rollNumber}` : 'Authoritative timer idle'}
          </div>
        </div>

        {/* Metric 3: Under Evaluation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Evaluating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Rubric Check
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate">Copies under scrutiny</div>
        </div>

        {/* Metric 4: Verified Transcripts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Transcripts
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {releasedCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Published
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate">Marked & verified</div>
        </div>
      </div>

      {/* THREE-COLUMN EXAMINATION WORKSPACE CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-widest uppercase font-mono">
            Examination Workspace Controls
          </h3>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Direct Board Access Points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Action 1: Start 3h 15m Board Test */}
          <button
            onClick={onStartRealBoardExam}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-orange-200/80 dark:border-orange-900/60 bg-gradient-to-br from-orange-50/50 to-amber-50/20 dark:from-orange-950/20 dark:to-slate-900 hover:border-orange-300 dark:hover:border-orange-800 transition-all text-left group min-h-[58px]"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Start 3h 15m Board Test</span>
                <ChevronRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Science 824 (EJ) · Unique 10-digit roll allocation
              </p>
            </div>
          </button>

          {/* Action 2: Model Paper Hub */}
          <button
            onClick={() => onNavigate('tests')}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group min-h-[58px]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Browse Question Papers</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Math, Science, Social Science, Hindi, English
              </p>
            </div>
          </button>

          {/* Action 3: Result Checker */}
          <button
            onClick={() => onNavigate('results')}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left group min-h-[58px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Verify Roll Marksheet</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                10-digit roll number + security CAPTCHA verification
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* OFFICIAL EXAMINATION PROTOCOL — EDITORIAL NUMBERING (NO PILL CAPSULES) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Official Examination Practice Protocol
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The rigorous 6-step workflow that simulates the real UPMSP examination experience
            </p>
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium self-start sm:self-auto flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Topper Discipline</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { step: '01', title: 'Unique 10-Digit Roll Allocation', desc: 'Starting a paper issues a distinctive 10-digit roll number (e.g. 1024883921) to anchor your attempt.' },
            { step: '02', title: 'Offline Copy Hand-Writing', desc: 'Keep physical question paper before you. Write all solutions in fair notebook without on-screen distraction.' },
            { step: '03', title: 'Header Roll Inscription', desc: 'Mandatory: inscribe your 10-digit roll number on the top margin of every single fair copy page.' },
            { step: '04', title: 'Authoritative Brass Bells', desc: 'School brass bells chime at commencement, 1h, 2h, 3h, 10-minute warning, and conclusion.' },
            { step: '05', title: '7-Minute Photo Submission', desc: 'When the writing timer stops, capture each written page in sequence before the upload window closes.' },
            { step: '06', title: 'Instant Marksheet Release', desc: 'AI rubric evaluation grades answers. Verify marksheet immediately via the public Result Checker.' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/60 space-y-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                  {item.step}.
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT EXAMINATION TRANSCRIPTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Examination Transcripts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical ledger of candidate submissions and verified evaluations
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <FileText className="w-9 h-9 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No examination attempts recorded</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
              Launch your first board test to begin building your handwritten examination transcript.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {attempts.slice(0, 5).map((att) => (
              <div
                key={att.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-all gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{att.subjectName}</span>
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        ({att.paperCode})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Roll: {att.rollNumber} · {new Date(att.serverStartTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-mono font-semibold ${
                    att.status === 'released'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {att.status === 'released' ? `Verified: ${att.evaluation?.totalMarksAwarded}/70 Marks` : att.status.toUpperCase()}
                  </span>

                  {att.status === 'released' ? (
                    <button
                      onClick={() => onSelectAttemptForSolution(att.id)}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View Marking Scheme
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate(att.status === 'in_progress' ? 'active_exam' : 'upload')}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Resume Desk
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

