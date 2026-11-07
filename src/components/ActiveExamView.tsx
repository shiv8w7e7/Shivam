import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Copy,
  Check,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bell,
  CheckCircle2,
  Shield,
  UploadCloud,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ExamAttempt, QuestionPaper } from '../types';

interface ActiveExamViewProps {
  attempt: ExamAttempt;
  paper: QuestionPaper;
  remainingSeconds: number;
  onFinishExam: () => void;
  onPauseOrExit: () => void;
}

export const ActiveExamView: React.FC<ActiveExamViewProps> = ({
  attempt,
  paper,
  remainingSeconds,
  onFinishExam,
  onPauseOrExit,
}) => {
  const [copiedRoll, setCopiedRoll] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Spoken announcement triggers tracking
  const announcedRefs = useRef({
    start: false,
    oneHour: false,
    twoHours: false,
    threeHours: false,
    tenMin: false,
    fiveMin: false,
    end: false,
  });

  const totalSeconds = (attempt.durationMinutes || 195) * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

  useEffect(() => {
    // Start bell
    if (!announcedRefs.current.start && elapsedSeconds < 10) {
      announcedRefs.current.start = true;
      soundManager.playScheduleAnnouncement('start', 'en');
    }

    // 1 Hour elapsed
    if (elapsedSeconds >= 3600 && !announcedRefs.current.oneHour && attempt.durationMinutes >= 120) {
      announcedRefs.current.oneHour = true;
      soundManager.playScheduleAnnouncement('1hr', 'en');
    }

    // 2 Hours elapsed
    if (elapsedSeconds >= 7200 && !announcedRefs.current.twoHours && attempt.durationMinutes >= 180) {
      announcedRefs.current.twoHours = true;
      soundManager.playScheduleAnnouncement('2hr', 'en');
    }

    // 3 Hours elapsed
    if (elapsedSeconds >= 10800 && !announcedRefs.current.threeHours && attempt.durationMinutes >= 195) {
      announcedRefs.current.threeHours = true;
      soundManager.playScheduleAnnouncement('3hr', 'en');
    }

    // 10 minutes remaining
    if (remainingSeconds <= 600 && remainingSeconds > 590 && !announcedRefs.current.tenMin) {
      announcedRefs.current.tenMin = true;
      soundManager.playScheduleAnnouncement('10min', 'en');
    }

    // 5 minutes remaining
    if (remainingSeconds <= 300 && remainingSeconds > 290 && !announcedRefs.current.fiveMin) {
      announcedRefs.current.fiveMin = true;
      soundManager.playScheduleAnnouncement('5min', 'en');
    }

    // Timer hit zero -> transition to upload window
    if (remainingSeconds <= 0 && !announcedRefs.current.end) {
      announcedRefs.current.end = true;
      soundManager.playScheduleAnnouncement('end', 'en');
      onFinishExam();
    }
  }, [remainingSeconds, elapsedSeconds, attempt.durationMinutes, onFinishExam]);

  // Format HH:MM:SS
  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyRoll = () => {
    navigator.clipboard.writeText(attempt.rollNumber);
    setCopiedRoll(true);
    setTimeout(() => setCopiedRoll(false), 2000);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleTestBell = () => {
    soundManager.playBrassBell('single');
  };

  const isUrgent = remainingSeconds <= 600; // Last 10 minutes

  // Bell Milestones
  const bellMilestones = [
    { id: 'm_start', label: 'Commence Bell', time: '00:00', desc: 'Writing Begins', isPassed: elapsedSeconds >= 0 },
    { id: 'm_1hr', label: '1st Hour Bell', time: '01:00', desc: 'Single Chime', isPassed: elapsedSeconds >= 3600 },
    { id: 'm_2hr', label: '2nd Hour Bell', time: '02:00', desc: 'Midway Chime', isPassed: elapsedSeconds >= 7200 },
    { id: 'm_3hr', label: '3rd Hour Bell', time: '03:00', desc: 'Double Chime', isPassed: elapsedSeconds >= 10800 },
    { id: 'm_10min', label: '10 Min Warning', time: '03:05', desc: 'Urgent Bell', isPassed: remainingSeconds <= 600 },
    { id: 'm_end', label: 'Final Bell', time: '03:15', desc: 'Pens Down & Upload', isPassed: remainingSeconds <= 0 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-36 px-1 sm:px-2">
      {/* EXAM HALL HEADER: Subject & Paper Code */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-bold font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>Official UP Board Examination Hall</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {paper.title}
            </h2>

            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="text-slate-900 dark:text-slate-200 font-bold">
                Paper Code: {paper.paperCode}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>Theory 70 Marks</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>Candidate: {attempt.studentName}</span>
            </div>
          </div>


          {/* Sound & Bell Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute bell sounds' : 'Mute bell sounds'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-orange-600" />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            <button
              onClick={handleTestBell}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <Bell className="w-3.5 h-3.5 text-orange-600" />
              <span>Chime</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY TWO TILES: 10-DIGIT ROLL NUMBER & LIVE COUNTDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Tile 1: 10-Digit Roll Number */}
        <div className="bg-orange-50/70 dark:bg-slate-900 border-2 border-orange-300 dark:border-orange-800/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">
              <span>Your Official Roll Number</span>
              <span className="font-mono text-[10px] bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded text-orange-800 dark:text-orange-300">
                10 Digits
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-slate-950 dark:text-orange-300 select-all">
                {attempt.rollNumber}
              </span>

              <button
                onClick={handleCopyRoll}
                className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs transition shrink-0 active:scale-95"
              >
                {copiedRoll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRoll ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-800/80 rounded-xl border border-orange-200/80 dark:border-orange-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px]">
              <strong className="text-orange-900 dark:text-orange-300">Mandatory: </strong>
              Write <span className="font-mono font-bold">{attempt.rollNumber}</span> at the top of every page of your physical copy before solving.
            </p>
          </div>
        </div>

        {/* Tile 2: Authoritative Countdown Clock */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border-2 flex flex-col justify-between space-y-3 transition ${
            isUrgent
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Time Remaining</span>
              </span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                Authoritative
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider">
                {formatTimer(remainingSeconds)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / {Math.floor(totalSeconds / 60)}m
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isUrgent ? 'bg-rose-600' : 'bg-orange-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span>{Math.round(progressPercent)}% elapsed</span>
              <span>{Math.ceil(remainingSeconds / 60)} min left</span>
            </div>
          </div>
        </div>
      </div>

      {/* OFFLINE PHYSICAL COPY WRITING INSTRUCTIONS (NO ON-SCREEN QUESTIONS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Physical Copy Writing In Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questions are on your physical paper. Solve and write step-by-step in your notebook.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>1. Handwritten Only</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Write all answers by hand using blue or black pen in your fair-copy notebook.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>2. 10-Digit Roll Header</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Put Roll <strong className="font-mono text-orange-600">{attempt.rollNumber}</strong> on top of every page.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>3. 7-Min Photo Upload</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When finished, take photos of each page. Evaluation produces instant results.
            </p>
          </div>
        </div>
      </div>

      {/* BELL TIMELINE CHIPS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-orange-600" />
            <span>Official Exam Bell Timeline</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">195 Min Real Board</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {bellMilestones.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded-xl border text-center transition ${
                m.isPassed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">{m.label}</div>
              <div className="text-[9px] text-slate-400">{m.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FIXED ERGONOMIC MOBILE-FRIENDLY BOTTOM ACTION BAR (NEVER BLOCKED BY POPUPS) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-3 pb-safe shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Pause / Exit button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 min-h-[44px]"
          >
            Pause / Exit
          </button>

          {/* PRIMARY DIRECT ACTION BUTTON: FINISH & OPEN 7-MIN UPLOAD */}
          <button
            onClick={onFinishExam}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span className="truncate">Conclude Writing & Open 7-Min Upload</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Exit / Pause Confirmation Modal (Only shows when user deliberately clicks Pause/Exit) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Pause or Exit Examination?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                The authoritative server timer will continue running. Your Roll Number is{' '}
                <strong className="font-mono text-orange-600">{attempt.rollNumber}</strong>. You can resume at any time.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Stay in Exam
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onPauseOrExit();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
