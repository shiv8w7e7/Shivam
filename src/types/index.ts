export type SubjectId = 'science' | 'math' | 'social_science' | 'hindi' | 'english';
export type ClassLevel = '10' | '12';

export type TestMode =
  | 'real_board'
  | 'single_chapter'
  | 'multi_chapter'
  | 'subject_test'
  | 'half_yearly'
  | 'quick_practice'
  | 'custom';

export type ExamStatus =
  | 'scheduled'
  | 'in_progress'
  | 'upload_window'
  | 'evaluating'
  | 'flagged'
  | 'released'
  | 'expired';

export interface UserProfile {
  name: string;
  classLevel: ClassLevel;
  targetYear: string;
  avatarUrl: string;
  goalDescription: string;
  schoolName?: string;
  targetScorePercent: number;
}

export interface QuestionPaper {
  id: string;
  title: string;
  subject: SubjectId;
  classLevel: ClassLevel;
  paperCode: string; // e.g. "824 (EJ)"
  year: string;
  durationMinutes: number; // 195 for Real Board (3 hrs 15 min)
  maxMarks: number; // 70 marks theory
  instructions: string[];
  sections: {
    sectionId: 'A' | 'B';
    name: string;
    instructions: string;
    marks: number;
  }[];
}

export interface UploadedPage {
  pageId: string;
  pageNumber: number;
  imageUrl: string;
  fileSize: number;
  uploadedAt: number;
  rotation: number;
}

export interface QuestionEvaluation {
  questionNumber: number;
  maxMarks: number;
  marksAwarded: number;
  studentAnswerSnippet: string;
  criteriaMet: string[];
  criteriaMissed: string[];
  examinerRemarks: string;
  confidence: number;
}

export interface EvaluationResult {
  attemptId: string;
  rollNumberDetected: string;
  rollNumberMatched: boolean;
  ocrConfidence: number;
  provider: 'gemini-3.8-flash' | 'groq-llama-vision' | 'expert-heuristic';
  evaluatedAt: number;
  totalMarksAwarded: number;
  maxMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  grandTotal: number;
  percentage: number;
  grade: string;
  status: 'FIRST_DIVISION' | 'SECOND_DIVISION' | 'THIRD_DIVISION' | 'FAILED';
  sectionAMarks: number;
  sectionBMarks: number;
  questionEvaluations: QuestionEvaluation[];
  strengths: string[];
  areasForImprovement: string[];
  topperTips: string[];
  flags: string[];
}

export interface ExamAttempt {
  id: string;
  rollNumber: string; // 10-digit unique numeric roll number
  studentUid: string;
  studentName: string;
  paperId: string;
  subject: SubjectId;
  subjectName: string;
  paperCode: string;
  mode: TestMode;
  durationMinutes: number;
  serverStartTime: number;
  serverEndTime: number;
  serverUploadDeadline: number;
  status: ExamStatus;
  uploadedPages: UploadedPage[];
  evaluation?: EvaluationResult;
  flaggedReason?: string;
  adminOverride?: {
    overriddenBy: string;
    overrideReason: string;
    previousMarks: number;
    newMarks: number;
    timestamp: number;
  };
  releaseTime: number; // Unix timestamp
  isReleased: boolean;
}

export interface PublicResultView {
  rollNumber: string;
  candidateName: string;
  examination: string;
  subject: string;
  paperCode: string;
  examDate: string;
  theoryMarks: number;
  maxTheoryMarks: number;
  practicalMarks: number;
  maxPracticalMarks: number;
  grandTotal: number;
  maxGrandTotal: number;
  percentage: number;
  grade: string;
  division: string;
  resultStatus: 'PASSED' | 'FAILED' | 'PENDING_RELEASE' | 'NOT_FOUND';
  sectionABreakdown: { mcqsAttempted: number; score: number; max: number };
  sectionBBreakdown: { descriptiveScore: number; max: number };
  releaseTime: number;
  isReleased: boolean;
  qrVerificationCode: string;
}

export interface CaptchaChallenge {
  captchaId: string;
  svg: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  targetId: string;
  details: string;
  ipMasked?: string;
}
