import React from 'react';
import {
  History,
  FileCheck2,
  ArrowRight,
  Award,
} from 'lucide-react';
import { ExamAttempt } from '../types';

interface TestHistoryViewProps {
  attempts: ExamAttempt[];
  onSelectAttemptForSolution: (attemptId: string) => void;
  onNavigateToResultChecker: (rollNumber: string) => void;
  onStartNewExam: () => void;
}

export const TestHistoryView: React.FC<TestHistoryViewProps> = ({
  attempts,
  onSelectAttemptForSolution,
  onNavigateToResultChecker,
  onStartNewExam,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-24 px-1 sm:px-2">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">
            <History className="w-4 h-4 text-orange-600" />
            <span>Candidate Examination Ledger</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Historical Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Practice Examination History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record of all allocated 10-digit roll numbers and evaluated answer copies.
          </p>
        </div>

        <button
          onClick={onStartNewExam}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-[0_4px_16px_rgba(234,88,12,0.25)] transition-all self-start sm:self-auto min-h-[46px] active:scale-98"
        >
          <span>Start Real Board Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* History List */}
      {attempts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
          <FileCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Prior Examination History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
            Take a standardized UP Board practice examination to begin building your transcript.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {attempts.map((att) => (
            <div
              key={att.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs mt-0.5">
                  {att.paperCode.split(' ')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{att.subjectName}</h4>
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {att.paperCode}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    <span className="font-bold text-orange-600 dark:text-orange-400">Roll: {att.rollNumber}</span>
                    <span>·</span>
                    <span>{new Date(att.serverStartTime).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{att.uploadedPages.length} Pages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {att.evaluation ? (
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {att.evaluation.totalMarksAwarded} / 70
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {att.evaluation.percentage}% ({att.evaluation.grade})
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded">
                    Evaluating
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToResultChecker(att.rollNumber)}
                    className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition min-h-[38px]"
                  >
                    <span>Marksheet</span>
                  </button>

                  {att.evaluation && (
                    <button
                      onClick={() => onSelectAttemptForSolution(att.id)}
                      className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition min-h-[38px]"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Analysis</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
