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
} from "./models";

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
  token_type: "bearer";
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
  role?: "admin" | "user";
  created_at: ISODateString;
}

// --- Admin Auth Service Schemas ---

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  status: "authenticated";
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  admin: AdminUser;
}

export interface AdminTotpRequiredResponse {
  status: "totp_required";
  pre_auth_token: string;
  expires_in: number;
}

export interface AdminTotpEnrollmentRequiredResponse {
  status: "totp_enrollment_required";
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
  role?: "admin" | "super_admin";
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

export type RedactedQuestion = Omit<
  Question,
  "correct_option_index" | "explanation" | "source_type" | "review_status"
>;

export interface QuizDetail extends Omit<Quiz, "question_ids"> {
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

export interface AttemptSummary extends Omit<Attempt, "answers"> {
  quiz_title: string;
}

export interface ReviewQuestionRequest {
  status: ReviewStatus;
  feedback?: string;
}

// --- Admin Service Schemas ---

export interface AdminQuestionsFilter {
  status?: ReviewStatus | "all";
  topic_id?: UUID;
  source_type?: QuestionSourceType | "all";
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
  status?: PurchaseStatus | "all";
  user_id?: UUID;
}

// --- WebSocket Timer Protocol ---

export type TimerWebSocketMessage =
  | { type: "tick"; remaining_seconds: number }
  | { type: "expired"; message: string };

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
  status: "completed" | "failed";
}

export type PurchaseHistoryResponse = Purchase[];

// --- Admin Dashboard Schemas ---

export type AdminDashboardDateRange = "today" | "7d" | "30d" | "custom";

export interface AdminDashboardSummary {
  registered_users: number;
  registered_users_delta: number;
  active_dau: number;
  active_dau_delta: number;
  active_wau: number;
  active_wau_delta: number;
  active_mau: number;
  active_mau_delta: number;
  new_signups: number;
  new_signups_delta: number;
  paying_users: number;
  paying_users_delta: number;
  free_to_paid_conversion: number;
  free_to_paid_delta: number;
  revenue: number;
  revenue_delta: number;
  attempts_started: number;
  attempts_completed: number;
  attempts_delta: number;
  pending_reviews: number;
  failed_purchases: number;
  open_reports: number;
}

export interface AdminTimeseriesPoint {
  date: string; // YYYY-MM-DD
  signups: number;
  active_users: number;
  revenue: number;
}

export interface AdminTimeseriesData {
  points: AdminTimeseriesPoint[];
}

export interface AdminFunnelStep {
  name: string;
  count: number;
  percentage: number;
}

export interface AdminFunnelData {
  steps: AdminFunnelStep[];
}

export interface AdminTopQuizItem {
  id: UUID;
  title: string;
  topic_name: string;
  revenue: number;
  attempts: number;
  completion_rate: number;
}

export interface AdminAttentionItem {
  id: string;
  type: "pending_review" | "failed_purchase" | "user_report" | "stuck_attempt";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  link: string;
  timestamp: ISODateString;
}

export interface AdminAttentionData {
  items: AdminAttentionItem[];
}

export interface AdminRecentSignup {
  id: UUID;
  name: string;
  email: string;
  source: "email" | "google";
  created_at: ISODateString;
}

export interface AdminRecentPurchase {
  id: UUID;
  user_id: UUID;
  user_name: string;
  user_email: string;
  item_title: string;
  amount: number;
  status: PurchaseStatus;
  created_at: ISODateString;
}

export interface AdminAuditActivityItem {
  id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: ISODateString;
}

// --- Admin Users Schemas ---

export interface AdminUserListItem {
  id: UUID;
  name: string;
  email: string;
  status: "active" | "suspended";
  source: "email" | "google";
  created_at: ISODateString;
  last_seen_at: ISODateString | null;
  quizzes_purchased: number;
  total_spent: number;
  attempts_count: number;
}

export interface AdminUsersSummaryChips {
  total_registered: number;
  active_30d: number;
  suspended: number;
  paying_customers: number;
}

export interface AdminUsersListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  page_size: number;
  summary: AdminUsersSummaryChips;
}

export interface AdminUsersListParams {
  search?: string;
  status?: "all" | "active" | "suspended";
  has_purchased?: "all" | "yes" | "no";
  source?: "all" | "email" | "google";
  signup_from?: string;
  signup_to?: string;
  last_active_from?: string;
  last_active_to?: string;
  sort_by?: "created_at" | "last_seen_at" | "total_spent" | "quizzes_purchased";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface AdminUserAttemptItem {
  id: UUID;
  quiz_id: UUID;
  quiz_title: string;
  topic_name: string;
  score: number;
  total_questions: number;
  is_free_attempt: boolean;
  explanations_unlocked: boolean;
  started_at: ISODateString;
  completed_at: ISODateString | null;
  duration_seconds: number;
}

export interface AdminUserQuestionBreakdown {
  question_id: UUID;
  stem: string;
  options: string[];
  user_answer_index: number;
  correct_answer_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface AdminUserPurchaseItem {
  id: UUID;
  item_title: string;
  amount: number;
  status: PurchaseStatus;
  payment_provider_ref: string;
  created_at: ISODateString;
}

export interface AdminUserFreeGrantItem {
  topic_id: UUID;
  topic_name: string;
  status: "available" | "used";
  used_at: ISODateString | null;
}

export interface AdminUserActivityItem {
  id: string;
  event_type:
    | "login"
    | "quiz_start"
    | "quiz_submit"
    | "purchase"
    | "free_grant_used"
    | "admin_action";
  title: string;
  description: string;
  timestamp: ISODateString;
}

export interface AdminUserNoteItem {
  id: string;
  user_id: UUID;
  admin_id: UUID;
  admin_name: string;
  admin_role: string;
  text: string;
  created_at: ISODateString;
}

export interface AdminUserDetail {
  id: UUID;
  name: string;
  email: string;
  status: "active" | "suspended";
  source: "email" | "google";
  created_at: ISODateString;
  last_seen_at: ISODateString | null;
  quizzes_purchased: number;
  total_spent: number;
  attempts_count: number;
  avg_score: number;
  streak_days: number;
  attempts: AdminUserAttemptItem[];
  purchases: AdminUserPurchaseItem[];
  free_grants: AdminUserFreeGrantItem[];
  activity: AdminUserActivityItem[];
  notes: AdminUserNoteItem[];
}

export interface SuspendUserRequest {
  reason: string;
}

export interface UnsuspendUserRequest {
  reason: string;
}

export interface GrantQuizRequest {
  quiz_id: UUID;
  reason: string;
}

export interface ResetFreeGrantRequest {
  topic_id: UUID;
  reason: string;
}

export interface CreateAdminNoteRequest {
  text: string;
}

export interface AuditEmailRevealRequest {
  user_id: UUID;
  reason?: string;
}
