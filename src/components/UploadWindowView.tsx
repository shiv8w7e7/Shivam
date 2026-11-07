import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RotateCw,
  Trash2,
  Maximize2,
  X,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldAlert,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { ExamAttempt, UploadedPage } from '../types';

interface UploadWindowViewProps {
  attempt: ExamAttempt;
  remainingUploadSeconds: number;
  onUploadPage: (fileDataUrl: string, mimeType: string, fileSize: number) => Promise<boolean>;
  onDeletePage: (pageId: string) => Promise<boolean>;
  onReorderPages: (pages: UploadedPage[]) => Promise<boolean>;
  onSubmitAllSheets: () => Promise<boolean>;
  onRequestReview: (reason: string) => void;
  isSubmitting: boolean;
}

export const UploadWindowView: React.FC<UploadWindowViewProps> = ({
  attempt,
  remainingUploadSeconds,
  onUploadPage,
  onDeletePage,
  onReorderPages,
  onSubmitAllSheets,
  onRequestReview,
  isSubmitting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [localPages, setLocalPages] = useState<UploadedPage[]>(attempt.uploadedPages || []);
  const [zoomPage, setZoomPage] = useState<UploadedPage | null>(null);
  const [confirmedRoll, setConfirmedRoll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  useEffect(() => {
    setLocalPages(attempt.uploadedPages || []);
  }, [attempt.uploadedPages]);

  // Format 7-min upload countdown
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isExpired = remainingUploadSeconds <= 0;

  // Process selected file (Compress via HTML5 Canvas to keep handwriting crisp but fast to evaluate)
  const processAndUploadFile = async (file: File) => {
    setErrorMessage(null);

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setErrorMessage(
        'Format Rejected: Only JPG, JPEG, PNG, and WEBP images are permitted. PDF, DOC, and text files are strictly prohibited.'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size too large. Maximum allowed is 25MB per image.');
      return;
    }

    setUploadProgress(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target?.result as string;

        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_DIM = 2048;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const success = await onUploadPage(compressedDataUrl, 'image/jpeg', compressedDataUrl.length);
            if (!success) {
              setErrorMessage('Failed to save page. Please try again.');
            }
          }
          setUploadProgress(false);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setErrorMessage('Error reading image file.');
      setUploadProgress(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  // Helper to generate a realistic handwritten notebook SVG page for immediate testing
  const handleAddSamplePage = async () => {
    setUploadProgress(true);
    const pageNum = localPages.length + 1;
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect width="100%" height="100%" fill="#fffef7"/>
      <line x1="70" y1="0" x2="70" y2="800" stroke="#fca5a5" stroke-width="2"/>
      <line x1="0" y1="90" x2="600" y2="90" stroke="#93c5fd" stroke-width="1.5"/>
      ${Array.from({ length: 22 }, (_, i) => `<line x1="0" y1="${120 + i * 30}" x2="600" y2="${120 + i * 30}" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
      <text x="80" y="60" font-family="monospace" font-size="20" font-weight="bold" fill="#0f172a">Roll No: ${attempt.rollNumber}</text>
      <text x="480" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="#64748b">Page ${pageNum}</text>
      <text x="80" y="82" font-family="sans-serif" font-size="12" fill="#ea580c">Subject: ${attempt.subjectName} | Code: ${attempt.paperCode}</text>
      <text x="85" y="145" font-family="cursive, sans-serif" font-size="16" fill="#1e293b" font-weight="bold">Section &apos;A&apos; — OMR Objective MCQs:</text>
      <text x="85" y="175" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">1. (A)   2. (A)   3. (A)   4. (B)   5. (B)   6. (B)</text>
      <text x="85" y="235" font-family="cursive, sans-serif" font-size="16" fill="#1e293b" font-weight="bold">Q21. Solution (Ohm&apos;s Law Verification):</text>
      <text x="85" y="265" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">At constant temperature, V = IR.</text>
      <text x="85" y="295" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">Given V = 220 V, I = 5 A =&gt; R = 220 / 5 = 44 Ohms.</text>
      <text x="85" y="325" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">Electric Power P = V * I = 220 * 5 = 1100 Watts.</text>
      <text x="85" y="385" font-family="cursive, sans-serif" font-size="16" fill="#1e293b" font-weight="bold">Q24. Human Heart Structure &amp; Double Circulation:</text>
      <text x="85" y="415" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">Right atrium receives deoxygenated blood -&gt; right ventricle</text>
      <text x="85" y="445" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">Lungs oxygenate blood -&gt; left atrium -&gt; left ventricle -&gt; body.</text>
      <text x="85" y="475" font-family="cursive, sans-serif" font-size="15" fill="#1e3a8a">Significance: Complete separation of oxygenated &amp; deoxygenated blood.</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
    await onUploadPage(dataUrl, 'image/jpeg', dataUrl.length);
    setUploadProgress(false);
  };

  const handleRotatePage = async (pageId: string) => {
    const updated = localPages.map((p) => {
      if (p.pageId === pageId) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    });
    setLocalPages(updated);
    await onReorderPages(updated);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const copy = [...localPages];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    copy.forEach((p, idx) => (p.pageNumber = idx + 1));
    setLocalPages(copy);
    await onReorderPages(copy);
  };

  const handleMoveDown = async (index: number) => {
    if (index === localPages.length - 1) return;
    const copy = [...localPages];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    copy.forEach((p, idx) => (p.pageNumber = idx + 1));
    setLocalPages(copy);
    await onReorderPages(copy);
  };

  const handleDelete = async (pageId: string) => {
    const success = await onDeletePage(pageId);
    if (success) {
      setLocalPages((prev) => prev.filter((p) => p.pageId !== pageId));
    }
  };

  const handleSubmit = async () => {
    if (localPages.length === 0) {
      setErrorMessage('Upload at least one photograph of your handwritten answer notebook.');
      return;
    }
    if (!confirmedRoll) {
      setErrorMessage('Please confirm that your 10-digit Roll Number is written on all pages.');
      return;
    }
    await onSubmitAllSheets();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-32 px-1 sm:px-2">
      {/* 7-MINUTE COUNTDOWN HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
              <Camera className="w-4 h-4 text-rose-600" />
              <span>Strict 7-Minute Photography Window</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>Sequential Pages</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Photograph & Upload Handwritten Notebook
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Roll No: <span className="font-bold text-orange-600 dark:text-orange-400">{attempt.rollNumber}</span> · Candidate: {attempt.studentName}
            </p>
          </div>

          {/* Large Countdown Timer Box */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border text-center shrink-0 self-start sm:self-auto min-w-[150px] transition-colors ${
              isExpired
                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : remainingUploadSeconds <= 120
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 animate-pulse'
                : 'bg-orange-50/70 dark:bg-orange-950/40 border-orange-200/80 dark:border-orange-900/60 text-orange-950 dark:text-orange-200'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upload Deadline
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider mt-0.5 tabular-nums">
              {isExpired ? '00:00' : formatCountdown(remainingUploadSeconds)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isExpired ? 'Window Closed' : '7 Minutes Total'}
            </div>
          </div>
        </div>
      </div>

      {/* EXPIRED BANNER */}
      {isExpired && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-950 dark:text-white">Upload Window Expired</div>
              <p className="mt-0.5 text-rose-800 dark:text-rose-300 leading-relaxed">
                The 7-minute limit has elapsed. Submit an urgent appeal if you faced camera issues.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition"
          >
            Request Review
          </button>
        </div>
      )}

      {/* ERROR TOAST */}
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ROLL NUMBER REMINDER BANNER */}
      <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory Verification: </strong>
          Ensure your 10-digit roll number{' '}
          <span className="font-mono font-bold bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-950 dark:text-amber-100">
            {attempt.rollNumber}
          </span>{' '}
          is clearly visible at the top of every uploaded photograph.
        </div>
      </div>

      {/* UPLOAD CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Notebook Pages
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              JPG, PNG, or WEBP images only. No PDF or text files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Direct Camera Button */}
            <button
              disabled={isExpired || uploadProgress}
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>

            {/* Gallery Upload Button */}
            <button
              disabled={isExpired || uploadProgress}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Gallery</span>
            </button>

            {/* Instant Sample Page (great for rapid test flow) */}
            <button
              disabled={isExpired || uploadProgress}
              onClick={handleAddSamplePage}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
              <span>+ Sample Page</span>
            </button>
          </div>
        </div>

        {uploadProgress && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs text-slate-600 dark:text-slate-300 font-medium animate-pulse">
            Processing and optimizing notebook photo for evaluation...
          </div>
        )}

        {/* PAGE LIST / GRID */}
        {localPages.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-2">
            <Camera className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No notebook pages uploaded yet</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tap &apos;Camera&apos; to snap Page 1 of your notebook, or tap &apos;+ Sample Page&apos; for testing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Uploaded Pages ({localPages.length} Total)</span>
              <span>Reorder / Rotate as needed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {localPages.map((page, idx) => (
                <div
                  key={page.pageId}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex flex-col justify-between space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                      Page {page.pageNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        title="Move Up"
                        className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === localPages.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        title="Move Down"
                        className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => setZoomPage(page)}
                    className="h-44 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80 overflow-hidden relative cursor-pointer flex items-center justify-center hover:border-orange-400 transition"
                  >
                    <img
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber}`}
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> Zoom
                      </span>
                    </div>
                  </div>

                  {/* Rotate & Delete */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => handleRotatePage(page.pageId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Rotate</span>
                    </button>

                    <button
                      onClick={() => handleDelete(page.pageId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION CHECKBOX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
          <input
            type="checkbox"
            checked={confirmedRoll}
            onChange={(e) => setConfirmedRoll(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
          />
          <span>
            I confirm that my 10-digit Roll Number (<strong className="font-mono text-orange-600">{attempt.rollNumber}</strong>) is written clearly on all {localPages.length} submitted notebook pages.
          </span>
        </label>
      </div>

      {/* DOCKED FIXED SUBMISSION ACTION BAR (SAFE AREA, EASY TO REACH ON PHONE) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-3 pb-safe shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {localPages.length} page{localPages.length === 1 ? '' : 's'} ready · Evaluates instantly
          </div>

          <button
            disabled={localPages.length === 0 || !confirmedRoll || isSubmitting}
            onClick={handleSubmit}
            className="flex-1 sm:flex-initial min-h-[48px] px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Evaluating & Generating Result...' : 'Submit Notebook for Instant Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {zoomPage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                Page {zoomPage.pageNumber} · Roll {attempt.rollNumber}
              </span>
              <button
                onClick={() => setZoomPage(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              <img
                src={zoomPage.imageUrl}
                alt="Enlarged page"
                style={{ transform: `rotate(${zoomPage.rotation}deg)` }}
                className="max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Request Delay Review</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              State the reason for upload delay (camera malfunction, battery drop, etc.).
            </p>
            <textarea
              rows={3}
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              placeholder="State reason here..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRequestReview(reviewReason);
                  setShowReviewModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
