export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface QuestionData {
  id: string;
  order: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tag: string;
  stem: string;
  highlightPhrase?: string;
  contextSnippet?: string;
  options: QuestionOption[];
  correctOptionIndex: number;
  correctLabel: string;
  optimalBadge?: string;
  explanation: string;
  codeSnippet?: string;
  diagramTitle?: string;
  diagramSubtitle?: string;
}

export interface QuizData {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  passMarkPercent: number;
  price: number; // in INR
  status: "free_available" | "locked" | "purchased" | "completed";
  lastScore?: number;
  lastAttemptDaysAgo?: number;
  questions: QuestionData[];
}

export interface TopicData {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  totalQuizzes: number;
  freeGrantAvailable: boolean;
  faangRelevancePercent: number;
  engineersTestedCount: string;
  quizzes: QuizData[];
}

export interface AnswerReviewItem {
  questionNumber?: number;
  categoryTag?: string;
  questionId?: string;
  order?: number;
  category?: string;
  stem: string;
  userAnswerText?: string;
  correctAnswerText?: string;
  selectedLabel?: string;
  correctLabel?: string;
  isCorrect: boolean;
  durationSeconds?: number;
  explanation: string;
  codeSnippet?: string;
  diagramTitle?: string;
  diagramSubtitle?: string;
  optimalBadge?: string;
}

export interface SubSkillScore {
  name: string;
  description: string;
  scorePercent: number;
  questionCountText: string;
  status: "Mastered" | "Proficient" | "Needs Review";
}

export interface DiagnosticResult {
  attemptId: string;
  quizId?: string;
  quizTitle: string;
  topicTitle: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  totalQuestions?: number;
  benchmarkPassed?: boolean;
  candidateTier?: string;
  rankBadge?: string;
  latencyFormatted: string;
  targetLatencyFormatted: string;
  percentile: string;
  levelBand: string;
  streakDays: number;
  xpEarned: number;
  subSkills: SubSkillScore[];
  questionsReview: AnswerReviewItem[];
}

export interface QuizSubmission {
  attemptId: string;
  quizId: string;
  answers: Record<number, number> | Record<string, string>;
  flaggedQuestions?: number[];
  timeSpentSeconds: number;
}

export interface QuizApiService {
  getTopics(): Promise<TopicData[]>;
  getTopic(slugOrId: string): Promise<TopicData | null>;
  getQuiz(quizId: string): Promise<QuizData | null>;
  getAttemptResult(attemptId: string): Promise<DiagnosticResult | null>;
  submitQuiz(submission: QuizSubmission): Promise<DiagnosticResult>;
  purchaseItem(itemId: string): Promise<boolean>;
  isItemPurchased(itemId: string): Promise<boolean>;
}
