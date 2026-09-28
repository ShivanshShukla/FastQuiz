/**
 * FastQuiz Core Domain Models
 * Directly mirrors docs/data_modal.md
 */

export type UUID = string;
export type ISODateString = string;

export type UserRole = 'admin' | 'user';
export type AdminRole = 'super_admin' | 'admin' | 'finance' | 'reviewer' | 'support';
export type UserStatus = 'active' | 'suspended';
export type UserSource = 'email' | 'google';

export interface User {
  id: UUID;
  name: string;
  email: string;
  role?: UserRole;
  status?: UserStatus;
  source?: UserSource;
  password_hash?: string | null;
  google_id?: string | null;
  last_seen_at?: ISODateString | null;
  created_at: ISODateString;
  updated_at?: ISODateString | null;
}

export interface AdminUser {
  id: UUID;
  name: string;
  email: string;
  role: AdminRole;
  totp_enabled: boolean;
  created_at: ISODateString;
}

export interface Topic {
  id: UUID;
  name: string;
  description: string;
}

export interface Quiz {
  id: UUID;
  topic_id: UUID;
  title: string;
  description: string;
  price: number;
  question_ids: UUID[];
  created_at: ISODateString;
}

export type QuestionSourceType = 'self_authored' | 'community' | 'ai_generated';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Question {
  id: UUID;
  quiz_id: UUID;
  text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  source_type: QuestionSourceType;
  review_status: ReviewStatus;
  order: number;
}

export interface AdminQuestionItem extends Question {
  topic_name?: string;
  topic_id?: UUID;
  quiz_title?: string;
  submitter_email?: string;
  submitted_at?: ISODateString;
  reject_reason?: string;
}

export interface AdminQuizItem extends Quiz {
  topic_name?: string;
  total_questions: number;
  approved_questions_count: number;
  pending_questions_count: number;
}

export interface Bundle {
  id: UUID;
  topic_id: UUID;
  quiz_ids: UUID[];
  price: number;
}

export interface FreeAttemptGrant {
  id: UUID;
  user_id: UUID;
  topic_id: UUID;
  used_at: ISODateString;
}

export interface Attempt {
  id: UUID;
  user_id: UUID;
  quiz_id: UUID;
  answers: Record<UUID, number>; // { question_id: selected_option_index }
  score: number;
  is_free_attempt: boolean;
  explanations_unlocked: boolean;
  started_at: ISODateString;
  completed_at?: ISODateString | null;
}

export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Purchase {
  id: UUID;
  user_id: UUID;
  user_email?: string;
  item_title?: string;
  quiz_id?: UUID | null;
  bundle_id?: UUID | null;
  amount: number;
  payment_provider_ref: string;
  status: PurchaseStatus;
  created_at: ISODateString;
}
