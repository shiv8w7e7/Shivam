import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Sliders,
} from 'lucide-react';
import { QuestionPaper, TestMode, UserProfile } from '../types';

interface TestHubViewProps {
  papers: QuestionPaper[];
  onStartExam: (paperId: string, mode: TestMode, customDuration?: number, candidateName?: string) => void;
  isLoading: boolean;
  userProfile: UserProfile;
}

export const TestHubView: React.FC<TestHubViewProps> = ({
  papers,
  onStartExam,
  isLoading,
  userProfile,
}) => {
  const [candidateName, setCandidateName] = useState<string>(userProfile.name || 'Shivam Kumar');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<TestMode>('real_board');
  const [classLevel, setClassLevel] = useState<'10' | '12'>((userProfile.classLevel as '10' | '12') || '10');
  const [customMinutes, setCustomMinutes] = useState<number>(45);

  const subjects = [
    { id: 'all', label: 'All Subjects' },
    { id: 'science', label: 'Science' },
    { id: 'math', label: 'Mathematics' },
    { id: 'social_science', label: 'Social Science' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'english', label: 'English' },
  ];

  const modes: { id: TestMode; label: string; desc: string; duration: string; icon: string }[] = [
    {
      id: 'real_board',
      label: 'Real Board Exam',
      desc: '3 Hours 15 Mins · 20 OMR + 50 Descriptive · Official School Brass Bell Sequence',
      duration: '195 Min',
      icon: '🔥',
    },
    {
      id: 'single_chapter',
      label: 'Chapter Drill',
      desc: '1 Hour · Dedicated chapter practice for rapid mastery',
      duration: '60 Min',
      icon: '📖',
    },
    {
      id: 'multi_chapter',
      label: 'Sectional Test',
      desc: '2 Hours · 3 combined chapters for midterm speed',
      duration: '120 Min',
      icon: '📚',
    },
    {
      id: 'quick_practice',
      label: 'Express 30m',
      desc: '30 Mins · 10 High-yield questions under speed constraint',
      duration: '30 Min',
      icon: '⚡',
    },
    {
      id: 'custom',
      label: 'Custom Timer',
      desc: 'Configure duration tailored to your study schedule',
      duration: 'Custom',
      icon: '⚙️',
    },
  ];

  const filteredPapers = papers.filter((p) => {
    if (selectedSubject !== 'all' && p.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8 px-1 sm:px-2">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* Unboxed Metadata Line */}
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Standardized UPMSP Board Curriculum</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>Theory 70 + Practical 30</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Model Paper Practice Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an official paper to allocate your 10-digit roll number and start your authoritative exam timer.
            </p>
          </div>

          {/* Class Level Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setClassLevel('10')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                classLevel === '10'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Class 10
            </button>
            <button
              onClick={() => setClassLevel('12')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                classLevel === '12'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Class 12</span>
              <span className="text-[10px] text-orange-600 font-mono font-bold">SOON</span>
            </button>
          </div>
        </div>

        {/* Candidate Name Input */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2 shrink-0 font-mono">
            <User className="w-3.5 h-3.5 text-orange-600" />
            <span>Candidate Name:</span>
          </label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Enter candidate name..."
            className="flex-1 max-w-sm text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Test Mode Selector Cards */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          1. Select Examination Mode
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {modes.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs ring-2 ring-orange-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mode.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{mode.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mode.duration}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{mode.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Custom duration slider if custom mode is chosen */}
        {selectedMode === 'custom' && (
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/60 rounded-xl mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Custom Duration:</span>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                {customMinutes} Minutes
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="195"
              step="15"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="w-full sm:w-64 accent-orange-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Subject Filter Tabs */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          2. Filter by Subject
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === sub.id
                  ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Listing Grid */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          3. Choose Question Paper & Start Exam
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      10th
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {paper.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Code: <span className="font-bold text-slate-700 dark:text-slate-300">{paper.paperCode}</span> · Max: <span className="font-bold text-slate-700 dark:text-slate-300">70</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded shrink-0">
                    {selectedMode === 'real_board' ? '3h 15m' : `${selectedMode === 'quick_practice' ? '30' : selectedMode === 'custom' ? customMinutes : '60'}m`}
                  </span>
                </div>

                {/* Section details */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Khand A: 20 MCQs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Khand B: 50 Descriptive</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>7-Min Upload Window</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Instant Verified Result</span>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Starting this test immediately allocates an authoritative 10-digit roll number.
                </div>
              </div>

              {/* Start CTA Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Offline Handwritten
                </span>
                <button
                  disabled={isLoading}
                  onClick={() =>
                    onStartExam(
                      paper.id,
                      selectedMode,
                      selectedMode === 'custom' ? customMinutes : undefined,
                      candidateName.trim() || 'Candidate'
                    )
                  }
                  className="min-h-[44px] inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
                >
                  <span>{isLoading ? 'Allocating Roll...' : 'Start Practice Test'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
