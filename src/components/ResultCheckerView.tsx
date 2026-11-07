import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  Printer,
  Award,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { PublicResultView, CaptchaChallenge } from '../types';

interface ResultCheckerViewProps {
  onViewDetailedSolution?: (attemptId: string) => void;
  defaultRollNumber?: string;
}

export const ResultCheckerView: React.FC<ResultCheckerViewProps> = ({
  onViewDetailedSolution,
  defaultRollNumber,
}) => {
  const [rollNumber, setRollNumber] = useState<string>(defaultRollNumber || '');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge | null>(null);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [marksheet, setMarksheet] = useState<PublicResultView | null>(null);
  const [fetchedAttemptId, setFetchedAttemptId] = useState<string | null>(null);

  // Sync if defaultRollNumber changes (e.g. from an active attempt)
  useEffect(() => {
    if (defaultRollNumber) {
      setRollNumber(defaultRollNumber);
    }
  }, [defaultRollNumber]);

  // Fetch new CAPTCHA challenge from server
  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaChallenge(data);
        setCaptchaInput('');
      } else {
        setErrorMessage('Failed to load security CAPTCHA.');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Network error fetching CAPTCHA.');
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingMessage(null);
    setMarksheet(null);
    setFetchedAttemptId(null);

    const cleanRoll = rollNumber.trim();
    if (!/^\d{10}$/.test(cleanRoll)) {
      setErrorMessage('Please enter a valid 10-digit numeric roll number (e.g. 1024883921).');
      return;
    }

    if (!captchaInput.trim() || !captchaChallenge) {
      setErrorMessage('Please enter the security verification code displayed in the image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/results/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: cleanRoll,
          captchaId: captchaChallenge.captchaId,
          captchaAnswer: captchaInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'No result found for this 10-digit Roll Number. Verify your number.');
        fetchCaptcha();
      } else {
        if (data.status === 'SUCCESS' && data.marksheet) {
          setMarksheet(data.marksheet);
          setFetchedAttemptId(data.attemptId);
        } else if (data.status === 'PENDING_RELEASE') {
          setPendingMessage(
            `${data.message} ${
              data.releaseTime
                ? `Release Time: ${new Date(data.releaseTime).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}`
                : ''
            }`
          );
        } else if (data.status === 'PROCESSING') {
          setPendingMessage(data.message || 'Result is currently being evaluated. Please check back shortly.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Please try again.');
      fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-24 px-1 sm:px-2">
      {/* Title & Verification Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UPMSP Official Marksheet Verification</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>Class 10 & 12</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              High School Examination Result Checker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your unique 10-digit roll number to access your authoritative verified transcript.
            </p>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-3 rounded-xl self-start sm:self-auto">
            <span className="font-bold text-slate-900 dark:text-white">Instant Release: </span>
            Evaluated copies activate results immediately.
          </div>
        </div>
      </div>

      {/* RESULT CHECKER LOOKUP FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs">
        <form onSubmit={handleCheckResult} className="space-y-4 max-w-md mx-auto">
          {/* 1. 10-digit Roll Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block font-mono">
              1. Candidate 10-Digit Roll Number
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={10}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1024883921"
                className="w-full text-base font-mono font-bold tracking-widest px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-inner"
              />
              <div className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-400 dark:text-slate-500 font-medium">
                {rollNumber.length}/10
              </div>
            </div>
          </div>

          {/* 2. Security CAPTCHA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block font-mono">
              2. Security Verification Code (CAPTCHA)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 min-h-[48px] min-w-[150px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs"
                  dangerouslySetInnerHTML={{
                    __html: captchaChallenge?.svg || '<span class="text-xs text-slate-400">Loading...</span>',
                  }}
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={isLoadingCaptcha}
                  title="Reload Security Code"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter Code"
                className="flex-1 text-sm font-mono font-bold uppercase tracking-wider px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* 3. Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || rollNumber.length !== 10}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-[0_4px_16px_rgba(234,88,12,0.25)] active:scale-98 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Check Official Marksheet'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {pendingMessage && (
          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 max-w-md mx-auto">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950 dark:text-amber-200">Processing Status</div>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">{pendingMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* VERIFIED UP BOARD MARKSHEET CARD */}
      {marksheet && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 sm:p-8 shadow-xl space-y-5 print:p-0 print:border-none print:shadow-none relative overflow-hidden">
          {/* Subtle Guilloche Certificate Tint */}
          <div className="text-center space-y-1.5 pb-5 border-b-2 border-slate-900 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Board of High School and Intermediate Education, Uttar Pradesh
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              High School Examination Marksheet 2026
            </h3>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wider">
              SHITEST AUTHORITATIVE EXAMINATION SYSTEM · DEVELOPED BY SHIVAM
            </div>
          </div>

          {/* Credentials Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Roll No</div>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {marksheet.rollNumber}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Candidate Name</div>
              <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate">{marksheet.candidateName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Subject & Code</div>
              <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                {marksheet.subject} ({marksheet.paperCode})
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Exam Date</div>
              <div className="font-medium text-slate-700 dark:text-slate-300 text-xs mt-0.5">{marksheet.examDate}</div>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[10px]">
                  <th className="p-2.5 rounded-tl-lg">Component</th>
                  <th className="p-2.5 text-center">Max</th>
                  <th className="p-2.5 text-center">Marks Obtained</th>
                  <th className="p-2.5 text-center rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    Section &apos;A&apos;: Objective / MCQs
                  </td>
                  <td className="p-2.5 text-center font-mono">20</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {marksheet.sectionABreakdown.score}
                  </td>
                  <td className="p-2.5 text-center text-emerald-600 font-bold">Passed</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    Section &apos;B&apos;: Handwritten Descriptive Solutions
                  </td>
                  <td className="p-2.5 text-center font-mono">50</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {marksheet.sectionBBreakdown.descriptiveScore}
                  </td>
                  <td className="p-2.5 text-center text-emerald-600 font-bold">Evaluated</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                  <td className="p-2.5 text-slate-900 dark:text-white">Total Theory</td>
                  <td className="p-2.5 text-center font-mono">{marksheet.maxTheoryMarks}</td>
                  <td className="p-2.5 text-center font-mono text-orange-600 dark:text-orange-400 font-bold">
                    {marksheet.theoryMarks}
                  </td>
                  <td className="p-2.5 text-center text-slate-700 dark:text-slate-300">Qualified</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 text-slate-700 dark:text-slate-300">Internal Assessment / Practical</td>
                  <td className="p-2.5 text-center font-mono">{marksheet.maxPracticalMarks}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {marksheet.practicalMarks}
                  </td>
                  <td className="p-2.5 text-center text-slate-600 dark:text-slate-400">Awarded</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td className="p-3">GRAND TOTAL</td>
                  <td className="p-3 text-center font-mono">{marksheet.maxGrandTotal}</td>
                  <td className="p-3 text-center font-mono text-base text-orange-400">
                    {marksheet.grandTotal} / {marksheet.maxGrandTotal}
                  </td>
                  <td className="p-3 text-center">
                    {marksheet.percentage}% ({marksheet.grade})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Division Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Result Status
                </div>
                <div className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                  {marksheet.division} · GRADE {marksheet.grade}
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Seal ID: {marksheet.qrVerificationCode}
            </div>
          </div>

          {/* Print & Solution Links */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800 no-print">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Print Marksheet</span>
            </button>

            {onViewDetailedSolution && fetchedAttemptId && (
              <button
                onClick={() => onViewDetailedSolution(fetchedAttemptId)}
                className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
              >
                <span>View Question-by-Question Marking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
