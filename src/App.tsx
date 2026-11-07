/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { TestHubView } from './components/TestHubView';
import { ActiveExamView } from './components/ActiveExamView';
import { UploadWindowView } from './components/UploadWindowView';
import { ResultCheckerView } from './components/ResultCheckerView';
import { DetailedSolutionView } from './components/DetailedSolutionView';
import { AdminPortalView } from './components/AdminPortalView';
import { TestHistoryView } from './components/TestHistoryView';
import { SplashScreen3D } from './components/SplashScreen3D';
import { ProfileModal } from './components/ProfileModal';
import { ExamAttempt, QuestionPaper, TestMode, UploadedPage, UserProfile } from './types';
import { standardPapers } from './data/questionPapers';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Shivam Kumar',
  classLevel: '10',
  targetYear: '2026',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shivam10&backgroundColor=b6e3f4',
  goalDescription: 'Targeting 95%+ and State Topper rank in UP Board 2026 handwritten exams.',
  schoolName: 'Government Inter College, Prayagraj',
  targetScorePercent: 96,
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // User Profile & Onboarding
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Examination State
  const [papers] = useState<QuestionPaper[]>(standardPapers);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [remainingExamSeconds, setRemainingExamSeconds] = useState<number>(0);
  const [remainingUploadSeconds, setRemainingUploadSeconds] = useState<number>(0);

  // Navigation targets
  const [solutionAttemptId, setSolutionAttemptId] = useState<string | null>('att_topper_seed_01');
  const [prefilledRollForChecker, setPrefilledRollForChecker] = useState<string>('1024883921');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('shitest_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('shitest_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load profile from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('shitest_user_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.warn('Could not parse user profile:', e);
    }
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('shitest_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  };

  // Load attempts from server
  const refreshAttempts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/attempts');
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      }
    } catch (e) {
      console.warn('Could not fetch attempts from server:', e);
    }
  }, []);

  useEffect(() => {
    refreshAttempts();
  }, [refreshAttempts]);

  // Synchronize Authoritative Timer with Server
  useEffect(() => {
    if (!activeAttempt) return;

    const syncServerClock = async () => {
      try {
        const res = await fetch(`/api/attempts/${activeAttempt.id}`);
        if (res.ok) {
          const data = await res.json();
          setActiveAttempt(data.attempt);
          setRemainingExamSeconds(data.remainingExamSeconds);
          setRemainingUploadSeconds(data.remainingUploadSeconds);

          // Auto-route to upload window if exam ended
          if (data.attempt.status === 'upload_window' && currentTab === 'active_exam') {
            setCurrentTab('upload');
          }
        }
      } catch (err) {
        console.warn('Clock sync err:', err);
      }
    };

    syncServerClock();

    const tickInterval = setInterval(() => {
      setRemainingExamSeconds((prev) => Math.max(0, prev - 1));
      setRemainingUploadSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    const serverSyncInterval = setInterval(syncServerClock, 10000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(serverSyncInterval);
    };
  }, [activeAttempt?.id, currentTab]);

  // Start Exam Handler: allocates unique 10-digit roll number server-side
  const handleStartExam = async (
    paperId: string,
    mode: TestMode,
    customDuration?: number,
    candidateName: string = userProfile.name || 'Candidate'
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          mode,
          durationMinutes: customDuration,
          studentUid: `student_${Date.now()}`,
          studentName: candidateName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAttempt(data.attempt);
        const durationSecs = (data.attempt.durationMinutes || 195) * 60;
        setRemainingExamSeconds(durationSecs);
        setRemainingUploadSeconds(7 * 60);
        setCurrentTab('active_exam');
        refreshAttempts();
      } else {
        alert('Could not start examination. Please retry.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error communicating with examination server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload single page
  const handleUploadPage = async (
    fileDataUrl: string,
    mimeType: string,
    fileSize: number
  ): Promise<boolean> => {
    if (!activeAttempt) return false;
    try {
      const res = await fetch(`/api/attempts/${activeAttempt.id}/upload-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: fileDataUrl,
          mimeType,
          fileSize,
          pageNumber: (activeAttempt.uploadedPages?.length || 0) + 1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAttempt((prev) => (prev ? { ...prev, uploadedPages: data.pages } : null));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Delete page
  const handleDeletePage = async (pageId: string): Promise<boolean> => {
    if (!activeAttempt) return false;
    try {
      const res = await fetch(`/api/attempts/${activeAttempt.id}/page/${pageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAttempt((prev) => (prev ? { ...prev, uploadedPages: data.pages } : null));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Reorder pages
  const handleReorderPages = async (updatedPages: UploadedPage[]): Promise<boolean> => {
    if (!activeAttempt) return false;
    try {
      const res = await fetch(`/api/attempts/${activeAttempt.id}/update-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: updatedPages }),
      });
      if (res.ok) {
        setActiveAttempt((prev) => (prev ? { ...prev, uploadedPages: updatedPages } : null));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Submit all sheets -> evaluated immediately so roll number can be checked in Result Checker right away!
  const handleSubmitAllSheets = async (): Promise<boolean> => {
    if (!activeAttempt) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/attempts/${activeAttempt.id}/submit-sheets`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAttempt(data.attempt);
        setPrefilledRollForChecker(data.attempt.rollNumber);
        setCurrentTab('results');
        refreshAttempts();
        return true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleSelectAttemptForSolution = (attemptId: string) => {
    setSolutionAttemptId(attemptId);
    setCurrentTab('solution');
  };

  const handleNavigateToResultChecker = (rollNumber: string) => {
    setPrefilledRollForChecker(rollNumber);
    setCurrentTab('results');
  };

  const currentPaper =
    papers.find((p) => p.id === activeAttempt?.paperId) || standardPapers[0];

  const currentSolutionAttempt =
    attempts.find((a) => a.id === solutionAttemptId) ||
    activeAttempt ||
    attempts[0] ||
    null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 overflow-hidden font-sans antialiased transition-colors select-none">
      {/* Grand 3D Splash Screen on Initial Load */}
      {showSplash && (
        <SplashScreen3D
          onComplete={() => setShowSplash(false)}
          brandName="ShiTest"
          tagline="Practice Like Board. Perform Like Topper."
        />
      )}

      {/* Candidate Profile / Onboarding Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSave={handleSaveProfile}
      />

      {/* Desktop Left Sidebar (Hidden on mobile) */}
      <div className="hidden lg:block h-full">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAttempt={activeAttempt}
          isAdmin={isAdmin}
        />
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              activeAttempt={activeAttempt}
              isAdmin={isAdmin}
              onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Utility Bar */}
        <TopBar
          currentTab={currentTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeAttempt={activeAttempt}
          isAdmin={isAdmin}
          onToggleAdmin={() => setIsAdmin(!isAdmin)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onReplaySplash={() => setShowSplash(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onStartRealBoardExam={() =>
                handleStartExam(standardPapers[0].id, 'real_board')
              }
              activeAttempt={activeAttempt}
              attempts={attempts}
              onSelectAttemptForSolution={handleSelectAttemptForSolution}
              userProfile={userProfile}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          )}

          {currentTab === 'tests' && (
            <TestHubView
              papers={papers}
              onStartExam={handleStartExam}
              isLoading={isLoading}
              userProfile={userProfile}
            />
          )}

          {currentTab === 'active_exam' && activeAttempt && (
            <ActiveExamView
              attempt={activeAttempt}
              paper={currentPaper}
              remainingSeconds={remainingExamSeconds}
              onFinishExam={() => setCurrentTab('upload')}
              onPauseOrExit={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'active_exam' && !activeAttempt && (
            <div className="max-w-md mx-auto py-12 text-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Examination Hall</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Start a paper to allocate your unique 10-digit roll number and start countdown bells.
              </p>
              <button
                onClick={() => setCurrentTab('tests')}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Go to Examination Directory
              </button>
            </div>
          )}

          {currentTab === 'upload' && activeAttempt && (
            <UploadWindowView
              attempt={activeAttempt}
              remainingUploadSeconds={remainingUploadSeconds}
              onUploadPage={handleUploadPage}
              onDeletePage={handleDeletePage}
              onReorderPages={handleReorderPages}
              onSubmitAllSheets={handleSubmitAllSheets}
              onRequestReview={(_reason) => alert('Appeal registered for Controller review.')}
              isSubmitting={isLoading}
            />
          )}

          {currentTab === 'upload' && !activeAttempt && (
            <div className="max-w-md mx-auto py-12 text-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Pending Upload Window</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The upload window opens automatically for 7 minutes after your exam ends.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {currentTab === 'results' && (
            <ResultCheckerView
              defaultRollNumber={prefilledRollForChecker}
              onViewDetailedSolution={handleSelectAttemptForSolution}
            />
          )}

          {currentTab === 'solution' && (
            <DetailedSolutionView
              attempt={currentSolutionAttempt}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'history' && (
            <TestHistoryView
              attempts={attempts}
              onSelectAttemptForSolution={handleSelectAttemptForSolution}
              onNavigateToResultChecker={handleNavigateToResultChecker}
              onStartNewExam={() => setCurrentTab('tests')}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPortalView
              onSelectAttemptForSolution={handleSelectAttemptForSolution}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation (Shown only on small screens; hidden during active exam/upload) */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAttempt={activeAttempt}
          onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
}
