import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  History,
} from 'lucide-react';
import { ExamAttempt, AuditLog } from '../types';

interface AdminPortalViewProps {
  onSelectAttemptForSolution: (attemptId: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Override Form
  const [newMarksInput, setNewMarksInput] = useState<string>('');
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [isOverriding, setIsOverriding] = useState<boolean>(false);

  // Load attempts & audit logs
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [attRes, logsRes] = await Promise.all([
        fetch('/api/admin/attempts'),
        fetch('/api/admin/audit-logs'),
      ]);
      if (attRes.ok) {
        const data = await attRes.json();
        setAttempts(data.attempts || []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = async (attId: string) => {
    try {
      const res = await fetch(`/api/admin/attempts/${attId}`);
      if (res.ok) {
        const fullAtt = await res.json();
        setSelectedAttempt(fullAtt);
        setNewMarksInput(String(fullAtt.evaluation?.theoryMarks ?? ''));
        setOverrideReasonInput('');
        setOverrideError(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitOverride = async () => {
    if (!selectedAttempt) return;
    if (!overrideReasonInput.trim() || overrideReasonInput.trim().length < 5) {
      setOverrideError('Mandatory justification note is required to alter candidate marks.');
      return;
    }
    const val = Number(newMarksInput);
    if (isNaN(val) || val < 0 || val > 70) {
      setOverrideError('Marks must be between 0 and 70.');
      return;
    }

    setIsOverriding(true);
    setOverrideError(null);
    try {
      const res = await fetch(`/api/admin/attempts/${selectedAttempt.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMarks: val,
          overrideReason: overrideReasonInput.trim(),
          adminName: 'Shivam (Examination Controller)',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedAttempt(data.attempt);
        loadData();
      } else {
        const err = await res.json();
        setOverrideError(err.error || 'Failed to commit marks override.');
      }
    } catch {
      setOverrideError('Network error committing marks.');
    } finally {
      setIsOverriding(false);
    }
  };

  const handleForceRelease = async (attId: string) => {
    try {
      const res = await fetch(`/api/admin/attempts/${attId}/release-now`, {
        method: 'POST',
      });
      if (res.ok) {
        loadData();
        if (selectedAttempt && selectedAttempt.id === attId) {
          handleOpenReview(attId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryAi = async (attId: string) => {
    try {
      const res = await fetch(`/api/admin/attempts/${attId}/retry-ai`, {
        method: 'POST',
      });
      if (res.ok) {
        loadData();
        if (selectedAttempt && selectedAttempt.id === attId) {
          handleOpenReview(attId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAttempts = attempts.filter((att) => {
    if (statusFilter !== 'all' && att.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = att.rollNumber.toLowerCase().includes(q);
      const matchName = att.studentName.toLowerCase().includes(q);
      const matchSubject = att.subjectName.toLowerCase().includes(q);
      return matchRoll || matchName || matchSubject;
    }
    return true;
  });

  const totalCandidates = attempts.length;
  const flaggedCount = attempts.filter((a) => a.status === 'flagged').length;
  const releasedCount = attempts.filter((a) => a.status === 'released').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-24 px-1 sm:px-2">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Controller of Examinations: Shivam</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              ShiTest Examination Authority & Moderation Desk
            </h2>
            <p className="text-xs text-slate-300">
              Real-time monitoring of UP Board 10-digit roll allocations, handwritten notebook uploads, and AI grading.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Admin Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Candidates
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{totalCandidates}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active database records</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Flagged Review
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 tabular-nums">{flaggedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Handwriting / Roll check</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Verified Results
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{releasedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Available in checker</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Evaluation Engine
          </div>
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1 truncate">Gemini Multimodal</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vision OCR + Rubric</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search roll number or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'in_progress', 'upload_window', 'evaluating', 'flagged', 'released'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-orange-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Roll Number</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Paper</th>
                <th className="p-3 text-center">Pages</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                    No examination records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{att.rollNumber}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{att.studentName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <div>{att.subjectName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{att.paperCode}</span>
                    </td>
                    <td className="p-3 text-center font-mono">{att.uploadedPages.length}</td>
                    <td className="p-3 text-center font-mono font-bold">
                      {att.evaluation ? `${att.evaluation.theoryMarks}/70` : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          att.status === 'released'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : att.status === 'evaluating'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                            : att.status === 'flagged'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'
                        }`}
                      >
                        {att.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(att.id)}
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                      {!att.isReleased && (
                        <button
                          onClick={() => handleForceRelease(att.id)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                        >
                          <span>Release</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT COPY & MARKS OVERRIDE MODAL */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Audit Attempt · ID: {selectedAttempt.id}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Roll: <span className="font-mono text-orange-600">{selectedAttempt.rollNumber}</span> ({selectedAttempt.studentName})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Uploaded Notebook Pages ({selectedAttempt.uploadedPages.length} Pages)
                </div>
                {selectedAttempt.uploadedPages.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-slate-400">
                    No images uploaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedAttempt.uploadedPages.map((p) => (
                      <div key={p.pageId} className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800">
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Page {p.pageNumber}
                        </div>
                        <div className="h-40 bg-white dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={p.imageUrl}
                            alt={`Page ${p.pageNumber}`}
                            style={{ transform: `rotate(${p.rotation}deg)` }}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedAttempt.evaluation && (
                <div className="p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">Current Evaluation:</span>
                    <span className="font-mono text-orange-900 dark:text-orange-200 text-sm">
                      {selectedAttempt.evaluation.theoryMarks} / 70 Theory
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Confidence: {Math.round(selectedAttempt.evaluation.ocrConfidence * 100)}%
                  </div>
                </div>
              )}

              {/* Override controls */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-600" />
                  <span>Manual Chief Examiner Override</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      New Theory Marks (Max 70)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={70}
                      value={newMarksInput}
                      onChange={(e) => setNewMarksInput(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Mandatory Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified Page 2 ray diagram manually..."
                      value={overrideReasonInput}
                      onChange={(e) => setOverrideReasonInput(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {overrideError && (
                  <div className="text-rose-600 text-xs font-semibold">{overrideError}</div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleRetryAi(selectedAttempt.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-run AI</span>
                  </button>

                  <button
                    disabled={isOverriding}
                    onClick={handleSubmitOverride}
                    className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    {isOverriding ? 'Saving...' : 'Commit Override'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Audit Trail</h3>
        </div>

        <div className="space-y-1.5">
          {auditLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] gap-1"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{log.actor}:</span>
                <span className="text-slate-600 dark:text-slate-400 truncate">{log.details}</span>
              </div>
              <span className="font-mono text-slate-400 text-[10px] shrink-0">
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
