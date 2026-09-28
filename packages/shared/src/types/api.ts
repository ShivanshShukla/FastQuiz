/**
 * FastQuiz API Request & Response Schemas
 * Directly mirrors docs/api_contract.md
 */

import type {
  AdminUser,
  Attempt,
  ISODateString,
  Purchase,
  PurchaseStatus,
  Question,
  QuestionSourceType,
  Quiz,
  ReviewStatus,
  Topic,
  User,
  UUID,
} from './models';

// --- Global API Types ---

export interface ApiErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

// --- Auth Service Schemas ---

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UserProfileResponse {
  id: UUID;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  created_at: ISODateString;
}

// --- Admin Auth Service Schemas ---

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  status: 'authenticated';
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  admin: AdminUser;
}

export interface AdminTotpRequiredResponse {
  status: 'totp_required';
  pre_auth_token: string;
  expires_in: number;
}

export interface AdminTotpEnrollmentRequiredResponse {
  status: 'totp_enrollment_required';
  pre_auth_token: string;
  qr_code_svg: string;
  secret: string;
  recovery_codes: string[];
  expires_in: number;
}

export type AdminLoginResult =
  | AdminAuthResponse
  | AdminTotpRequiredResponse
  | AdminTotpEnrollmentRequiredResponse;

export interface AdminTotpVerifyRequest {
  pre_auth_token: string;
  code: string;
}

export interface AdminTotpConfirmEnrollmentRequest {
  pre_auth_token: string;
  code: string;
}

export interface AdminInviteRequest {
  email: string;
  name: string;
  role?: 'admin' | 'super_admin';
}

export interface AdminInviteResponse {
  id: UUID;
  email: string;
  name: string;
  role: string;
  message: string;
}

// --- Quiz Service Schemas ---

export interface TopicSummary extends Topic {
  total_quizzes: number;
  free_attempt_available: boolean;
}

export interface QuizSummary {
  id: UUID;
  topic_id: UUID;
  title: string;
  description: string;
  price: number;
  question_count: number;
  is_purchased: boolean;
}

export type RedactedQuestion = Omit<Question, 'correct_option_index' | 'explanation' | 'source_type' | 'review_status'>;

export interface QuizDetail extends Omit<Quiz, 'question_ids'> {
  questions: RedactedQuestion[];
}

export interface StartQuizResponse {
  attempt_id: UUID;
  quiz_id: UUID;
  is_free_attempt: boolean;
  duration_seconds: number;
  started_at: ISODateString;
}

export interface SubmitAttemptRequest {
  answers: Record<UUID, number>; // { question_id: selected_option_index }
}

export interface QuestionResult {
  question_id: UUID;
  selected_option_index: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface AttemptResultResponse {
  attempt_id: UUID;
  score: number;
  total_questions: number;
  explanations_unlocked: boolean;
  results: QuestionResult[];
}

export interface AttemptSummary extends Omit<Attempt, 'answers'> {
  quiz_title: string;
}

export interface ReviewQuestionRequest {
  status: ReviewStatus;
  feedback?: string;
}

// --- Admin Service Schemas ---

export interface AdminQuestionsFilter {
  status?: ReviewStatus | 'all';
  topic_id?: UUID;
  source_type?: QuestionSourceType | 'all';
  search?: string;
}

export interface RejectQuestionRequest {
  reason: string;
}

export interface AdminReviewActionResponse {
  success: boolean;
  status: ReviewStatus;
  question_id: UUID;
  reason?: string;
}

export interface PurchasesFilter {
  status?: PurchaseStatus | 'all';
  user_id?: UUID;
}

// --- WebSocket Timer Protocol ---

export type TimerWebSocketMessage =
  | { type: 'tick'; remaining_seconds: number }
  | { type: 'expired'; message: string };

// --- Payments Service Schemas ---

export interface CreateCheckoutSessionResponse {
  purchase_id: UUID;
  amount: number;
  currency: string;
  checkout_url: string;
}

export interface PaymentWebhookPayload {
  event: string;
  purchase_id: UUID;
  provider_ref: string;
  status: 'completed' | 'failed';
}

export type PurchaseHistoryResponse = Purchase[];
