import React, { useState } from 'react';
import {
  CheckCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Check,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import { ExamAttempt } from '../types';

interface DetailedSolutionViewProps {
  attempt: ExamAttempt | null;
  onBackToDashboard: () => void;
}

export const DetailedSolutionView: React.FC<DetailedSolutionViewProps> = ({
  attempt,
  onBackToDashboard,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({
    1: true,
    21: true,
  });

  const toggleExpand = (qNum: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [qNum]: !prev[qNum] }));
  };

  if (!attempt || !attempt.evaluation) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Evaluation Loaded</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Please check your released result with your 10-digit roll number or select an evaluated test from your dashboard.
        </p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const ev = attempt.evaluation;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-24 px-1 sm:px-2">
      {/* Top Banner with Performance Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-0.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Detailed Solution & Step-by-Step Marking Audit
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="font-bold text-slate-800 dark:text-slate-200">Roll: {attempt.rollNumber}</span>
              <span>·</span>
              <span>{attempt.subjectName}</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Confidence: {Math.round(ev.ocrConfidence * 100)}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-xl text-center shrink-0 self-start sm:self-auto min-w-[130px]">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Theory Awarded</div>
            <div className="text-2xl font-mono font-black text-orange-900 dark:text-orange-200 mt-0.5">
              {ev.totalMarksAwarded} / {ev.maxMarks}
            </div>
            <div className="text-[10px] text-orange-700 dark:text-orange-400 font-semibold">{ev.percentage}% Score</div>
          </div>
        </div>
      </div>

      {/* TOPPER'S ADVICE & CONCEPT ANALYSIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Strengths */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {ev.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Target Areas for Board 95%+</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {ev.areasForImprovement.map((area, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* QUESTION-BY-QUESTION DETAILED AUDIT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Question-by-Question Marking Scheme
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {ev.questionEvaluations.length} Answers Evaluated
          </span>
        </div>

        <div className="space-y-2.5">
          {ev.questionEvaluations.map((qe) => {
            const isExpanded = expandedQuestions[qe.questionNumber] ?? false;
            const isFullScore = qe.marksAwarded === qe.maxMarks;

            return (
              <div
                key={qe.questionNumber}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              >
                <div
                  onClick={() => toggleExpand(qe.questionNumber)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isFullScore
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
                      }`}
                    >
                      Q{qe.questionNumber}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        Question {qe.questionNumber} Evaluation
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {qe.studentAnswerSnippet}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${
                        isFullScore
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {qe.marksAwarded} / {qe.maxMarks} Marks
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Student Extracted Answer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Extracted Student Answer from Handwritten Notebook
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 italic leading-relaxed font-serif">
                        &ldquo;{qe.studentAnswerSnippet}&rdquo;
                      </div>
                    </div>

                    {/* Criteria Met & Missed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          Official Criteria Met
                        </div>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {qe.criteriaMet?.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {qe.criteriaMissed && qe.criteriaMissed.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                            Missed Criteria / Step Deductions
                          </div>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {qe.criteriaMissed.map((m, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                <X className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Examiner Remarks */}
                    <div className="p-3 bg-orange-50/60 dark:bg-orange-950/30 rounded-xl border border-orange-200/70 dark:border-orange-900/60 space-y-1">
                      <div className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                        <span>Chief Examiner Remarks</span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {qe.examinerRemarks}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
