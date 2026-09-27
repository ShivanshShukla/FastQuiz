/**
 * FastQuiz Typed API Client
 * Mirrors docs/api_contract.md
 */

import type {
  AdminQuestionItem,
  AdminQuestionsFilter,
  AdminQuizItem,
  AdminReviewActionResponse,
  ApiErrorResponse,
  AuthResponse,
  CreateCheckoutSessionResponse,
  LoginRequest,
  Purchase,
  PurchasesFilter,
  PurchaseHistoryResponse,
  Question,
  QuizDetail,
  QuizSummary,
  RegisterRequest,
  ReviewQuestionRequest,
  StartQuizResponse,
  SubmitAttemptRequest,
  AttemptResultResponse,
  TopicSummary,
  UserProfileResponse,
  UUID,
} from '../types';

export class FastQuizApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, unknown> | null;

  constructor(status: number, errorResponse: ApiErrorResponse) {
    super(errorResponse.message || `API error with status ${status}`);
    this.name = 'FastQuizApiError';
    this.status = status;
    this.errorCode = errorResponse.error_code || 'UNKNOWN_ERROR';
    this.details = errorResponse.details;
  }
}

export interface ClientConfig {
  baseUrl?: string;
  authBaseUrl?: string;
  quizBaseUrl?: string;
  paymentsBaseUrl?: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  useMockFallback?: boolean;
}

export class FastQuizClient {
  private config: ClientConfig;
  private token: string | null = null;

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      authBaseUrl: config.authBaseUrl || config.baseUrl || 'http://localhost:8001',
      quizBaseUrl: config.quizBaseUrl || config.baseUrl || 'http://localhost:8002',
      paymentsBaseUrl: config.paymentsBaseUrl || config.baseUrl || 'http://localhost:8003',
      getAccessToken: config.getAccessToken,
      useMockFallback: config.useMockFallback ?? true,
    };
  }

  public setAccessToken(token: string | null): void {
    this.token = token;
  }

  public getAccessToken(): string | null {
    return this.token;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    let token = this.token;
    if (!token && this.config.getAccessToken) {
      token = await this.config.getAccessToken();
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = (await response.json()) as ApiErrorResponse;
        } catch {
          errorData = {
            error_code: 'HTTP_ERROR',
            message: `Request failed with status ${response.status} (${response.statusText})`,
          };
        }
        throw new FastQuizApiError(response.status, errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof FastQuizApiError) {
        throw err;
      }
      throw new FastQuizApiError(0, {
        error_code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network request failed',
      });
    }
  }

  // --- Auth API ---

  public readonly auth = {
    register: (data: RegisterRequest): Promise<AuthResponse> => {
      return this.request<AuthResponse>(this.config.authBaseUrl!, '/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: (data: LoginRequest): Promise<AuthResponse> => {
      return this.request<AuthResponse>(this.config.authBaseUrl!, '/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    refreshToken: (refreshToken: string): Promise<AuthResponse> => {
      return this.request<AuthResponse>(this.config.authBaseUrl!, '/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    },

    getMe: (): Promise<UserProfileResponse> => {
      return this.request<UserProfileResponse>(this.config.authBaseUrl!, '/auth/me');
    },
  };

  // --- Quiz API ---

  public readonly quiz = {
    listTopics: (): Promise<TopicSummary[]> => {
      return this.request<TopicSummary[]>(this.config.quizBaseUrl!, '/topics');
    },

    listQuizzes: (topicId?: UUID): Promise<QuizSummary[]> => {
      const query = topicId ? `?topic_id=${encodeURIComponent(topicId)}` : '';
      return this.request<QuizSummary[]>(this.config.quizBaseUrl!, `/quizzes${query}`);
    },

    getQuiz: (quizId: UUID): Promise<QuizDetail> => {
      return this.request<QuizDetail>(this.config.quizBaseUrl!, `/quizzes/${quizId}`);
    },

    startQuiz: (quizId: UUID): Promise<StartQuizResponse> => {
      return this.request<StartQuizResponse>(this.config.quizBaseUrl!, `/quizzes/${quizId}/start`, {
        method: 'POST',
      });
    },

    submitAttempt: (attemptId: UUID, data: SubmitAttemptRequest): Promise<AttemptResultResponse> => {
      return this.request<AttemptResultResponse>(this.config.quizBaseUrl!, `/attempts/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // --- Admin API ---

  public readonly admin = {
    /**
     * Legacy review action for single endpoint
     */
    reviewQuestion: (questionId: UUID, data: ReviewQuestionRequest): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(this.config.quizBaseUrl!, `/admin/questions/${questionId}/review`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    /**
     * GET /admin/questions?status=pending&topic_id=&source_type=
     */
    getQuestions: async (filters: AdminQuestionsFilter = {}): Promise<AdminQuestionItem[]> => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.topic_id) params.set('topic_id', filters.topic_id);
      if (filters.source_type && filters.source_type !== 'all') params.set('source_type', filters.source_type);
      if (filters.search) params.set('search', filters.search);

      const qs = params.toString() ? `?${params.toString()}` : '';
      try {
        return await this.request<AdminQuestionItem[]>(this.config.quizBaseUrl!, `/admin/questions${qs}`);
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return getMockAdminQuestions(filters);
      }
    },

    /**
     * GET /admin/questions/:id
     */
    getQuestion: async (questionId: UUID): Promise<AdminQuestionItem> => {
      try {
        return await this.request<AdminQuestionItem>(this.config.quizBaseUrl!, `/admin/questions/${questionId}`);
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        const found = getMockAdminQuestions().find((q) => q.id === questionId);
        if (!found) {
          throw new FastQuizApiError(404, {
            error_code: 'NOT_FOUND',
            message: `Question with id ${questionId} not found`,
          });
        }
        return found;
      }
    },

    /**
     * POST /admin/questions/:id/approve
     */
    approveQuestion: async (questionId: UUID): Promise<AdminReviewActionResponse> => {
      try {
        return await this.request<AdminReviewActionResponse>(
          this.config.quizBaseUrl!,
          `/admin/questions/${questionId}/approve`,
          { method: 'POST' }
        );
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return { success: true, status: 'approved', question_id: questionId };
      }
    },

    /**
     * POST /admin/questions/:id/reject — body: { reason }
     */
    rejectQuestion: async (questionId: UUID, reason: string): Promise<AdminReviewActionResponse> => {
      try {
        return await this.request<AdminReviewActionResponse>(
          this.config.quizBaseUrl!,
          `/admin/questions/${questionId}/reject`,
          {
            method: 'POST',
            body: JSON.stringify({ reason }),
          }
        );
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return { success: true, status: 'rejected', question_id: questionId, reason };
      }
    },

    /**
     * GET /admin/topics
     */
    getTopics: async (): Promise<TopicSummary[]> => {
      try {
        return await this.request<TopicSummary[]>(this.config.quizBaseUrl!, '/admin/topics');
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return MOCK_TOPICS;
      }
    },

    /**
     * GET /admin/topics/:id/quizzes
     */
    getQuizzesForTopic: async (topicId: UUID): Promise<AdminQuizItem[]> => {
      try {
        return await this.request<AdminQuizItem[]>(this.config.quizBaseUrl!, `/admin/topics/${topicId}/quizzes`);
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return MOCK_QUIZZES.filter((q) => q.topic_id === topicId);
      }
    },

    /**
     * GET /admin/quizzes/:id/questions
     */
    getQuestionsForQuiz: async (quizId: UUID): Promise<Question[]> => {
      try {
        return await this.request<Question[]>(this.config.quizBaseUrl!, `/admin/quizzes/${quizId}/questions`);
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        return getMockAdminQuestions().filter((q) => q.quiz_id === quizId);
      }
    },

    /**
     * GET /admin/purchases
     */
    getPurchases: async (filters: PurchasesFilter = {}): Promise<Purchase[]> => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.user_id) params.set('user_id', filters.user_id);
      const qs = params.toString() ? `?${params.toString()}` : '';

      try {
        return await this.request<Purchase[]>(this.config.paymentsBaseUrl!, `/admin/purchases${qs}`);
      } catch (err) {
        if (!this.config.useMockFallback) throw err;
        let list = [...MOCK_PURCHASES];
        if (filters.status && filters.status !== 'all') {
          list = list.filter((p) => p.status === filters.status);
        }
        return list;
      }
    },
  };

  // --- Payments API ---

  public readonly payments = {
    createQuizCheckout: (quizId: UUID): Promise<CreateCheckoutSessionResponse> => {
      return this.request<CreateCheckoutSessionResponse>(this.config.paymentsBaseUrl!, `/purchases/quiz/${quizId}`, {
        method: 'POST',
      });
    },

    createBundleCheckout: (bundleId: UUID): Promise<CreateCheckoutSessionResponse> => {
      return this.request<CreateCheckoutSessionResponse>(this.config.paymentsBaseUrl!, `/purchases/bundle/${bundleId}`, {
        method: 'POST',
      });
    },

    getPurchaseHistory: (): Promise<PurchaseHistoryResponse> => {
      return this.request<PurchaseHistoryResponse>(this.config.paymentsBaseUrl!, '/purchases/history');
    },
  };
}

// ============================================================================
// Fallback Mock Datasets for Admin App Offline / Dev Review Experience
// ============================================================================

export const MOCK_TOPICS: TopicSummary[] = [
  {
    id: 'topic-dsa-1',
    name: 'Arrays & Two Pointers',
    description: 'Sliding windows, in-place manipulation, two-pointer paradigms.',
    total_quizzes: 4,
    free_attempt_available: true,
  },
  {
    id: 'topic-sys-2',
    name: 'System Design Fundamentals',
    description: 'Load balancing, replication, CAP theorem, distributed cache.',
    total_quizzes: 5,
    free_attempt_available: true,
  },
  {
    id: 'topic-os-3',
    name: 'Concurrency & OS Concepts',
    description: 'Deadlocks, mutexes, virtual memory, thread scheduling.',
    total_quizzes: 3,
    free_attempt_available: true,
  },
];

export const MOCK_QUIZZES: AdminQuizItem[] = [
  {
    id: 'quiz-two-pointer',
    topic_id: 'topic-dsa-1',
    topic_name: 'Arrays & Two Pointers',
    title: 'Two-Pointer Technique Quiz',
    description: 'Master fast and slow pointers, container with most water.',
    price: 4.99,
    question_ids: ['q-1', 'q-2'],
    total_questions: 10,
    approved_questions_count: 8,
    pending_questions_count: 2,
    created_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'quiz-sliding-window',
    topic_id: 'topic-dsa-1',
    topic_name: 'Arrays & Two Pointers',
    title: 'Sliding Window Mastery',
    description: 'Fixed and dynamic window interview patterns.',
    price: 3.99,
    question_ids: ['q-3'],
    total_questions: 8,
    approved_questions_count: 7,
    pending_questions_count: 1,
    created_at: '2026-09-21T14:30:00Z',
  },
  {
    id: 'quiz-cache-design',
    topic_id: 'topic-sys-2',
    topic_name: 'System Design Fundamentals',
    title: 'Distributed Caching (Redis & Memcached)',
    description: 'Eviction policies, cache-aside, write-through.',
    price: 5.99,
    question_ids: ['q-4', 'q-5'],
    total_questions: 12,
    approved_questions_count: 10,
    pending_questions_count: 2,
    created_at: '2026-09-22T09:15:00Z',
  },
];

export const MOCK_ADMIN_QUESTIONS: AdminQuestionItem[] = [
  {
    id: 'q-mod-1',
    quiz_id: 'quiz-two-pointer',
    topic_id: 'topic-dsa-1',
    topic_name: 'Arrays & Two Pointers',
    quiz_title: 'Two-Pointer Technique Quiz',
    text: 'What is the minimum time complexity to determine if an array with N elements contains a pair that sums to target K when the array is already sorted?',
    options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(1)'],
    correct_option_index: 2,
    explanation: 'Using two pointers starting at opposite ends of the sorted array, each step moves either the left or right pointer, inspecting at most N elements.',
    source_type: 'ai_generated',
    review_status: 'pending',
    order: 1,
    submitter_email: 'gemini-model-generator@fastquiz.internal',
    submitted_at: '2026-09-27T08:30:00Z',
  },
  {
    id: 'q-mod-2',
    quiz_id: 'quiz-sliding-window',
    topic_id: 'topic-dsa-1',
    topic_name: 'Arrays & Two Pointers',
    quiz_title: 'Sliding Window Mastery',
    text: 'In the Maximum Sum Subarray problem with fixed window size K, what is the best space complexity possible without modifying input?',
    options: ['O(K)', 'O(N)', 'O(1)', 'O(log K)'],
    correct_option_index: 2,
    explanation: 'We only need to track the current window sum and max sum variables, requiring strictly O(1) auxiliary memory.',
    source_type: 'community',
    review_status: 'pending',
    order: 2,
    submitter_email: 'alex.engineer@gmail.com',
    submitted_at: '2026-09-27T11:15:00Z',
  },
  {
    id: 'q-mod-3',
    quiz_id: 'quiz-cache-design',
    topic_id: 'topic-sys-2',
    topic_name: 'System Design Fundamentals',
    quiz_title: 'Distributed Caching (Redis & Memcached)',
    text: 'Which cache invalidation strategy ensures data is written to both the cache and underlying database simultaneously before acknowledging success?',
    options: ['Cache-Aside', 'Write-Through', 'Write-Behind (Write-Back)', 'Refresh-Ahead'],
    correct_option_index: 1,
    explanation: 'Write-Through writes directly to both the cache and persistent store synchronously, eliminating stale reads at the cost of write latency.',
    source_type: 'self_authored',
    review_status: 'pending',
    order: 3,
    submitter_email: 'staff.author@fastquiz.dev',
    submitted_at: '2026-09-27T13:45:00Z',
  },
  {
    id: 'q-mod-4',
    quiz_id: 'quiz-cache-design',
    topic_id: 'topic-sys-2',
    topic_name: 'System Design Fundamentals',
    quiz_title: 'Distributed Caching (Redis & Memcached)',
    text: 'Under high concurrency, when a hot cache key expires and thousands of requests miss and hit the database simultaneously, this phenomenon is called:',
    options: ['Cache Stampede (Dog-piling)', 'Cache Penetration', 'Cache Avalanche', 'Split-Brain'],
    correct_option_index: 0,
    explanation: 'Cache stampede (or thundering herd / dog-piling) happens when a popular key expires and simultaneous requests concurrently hammer the DB to regenerate it.',
    source_type: 'ai_generated',
    review_status: 'pending',
    order: 4,
    submitter_email: 'claude-content-curator@fastquiz.internal',
    submitted_at: '2026-09-27T15:20:00Z',
  },
];

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'pur-101',
    user_id: 'usr-1',
    user_email: 'sarah.connor@sky.net',
    item_title: 'System Design Fundamentals Bundle',
    amount: 14.99,
    payment_provider_ref: 'pay_rzp_984328943',
    status: 'completed',
    created_at: '2026-09-27T14:10:00Z',
  },
  {
    id: 'pur-102',
    user_id: 'usr-2',
    user_email: 'dev.marcus@gmail.com',
    item_title: 'Two-Pointer Technique Quiz',
    amount: 4.99,
    payment_provider_ref: 'pay_rzp_118932402',
    status: 'completed',
    created_at: '2026-09-27T15:30:00Z',
  },
  {
    id: 'pur-103',
    user_id: 'usr-3',
    user_email: 'candidate.john@outlook.com',
    item_title: 'Sliding Window Mastery',
    amount: 3.99,
    payment_provider_ref: 'pay_rzp_773298114',
    status: 'failed',
    created_at: '2026-09-27T16:05:00Z',
  },
  {
    id: 'pur-104',
    user_id: 'usr-4',
    user_email: 'alex.tanaka@tokyo.ac.jp',
    item_title: 'Concurrency & OS Concepts Quiz',
    amount: 4.99,
    payment_provider_ref: 'pay_rzp_552190823',
    status: 'refunded',
    created_at: '2026-09-26T09:20:00Z',
  },
];

function getMockAdminQuestions(filters: AdminQuestionsFilter = {}): AdminQuestionItem[] {
  let list = [...MOCK_ADMIN_QUESTIONS];
  if (filters.status && filters.status !== 'all') {
    list = list.filter((q) => q.review_status === filters.status);
  }
  if (filters.topic_id) {
    list = list.filter((q) => q.topic_id === filters.topic_id);
  }
  if (filters.source_type && filters.source_type !== 'all') {
    list = list.filter((q) => q.source_type === filters.source_type);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter((q) => q.text.toLowerCase().includes(s) || q.quiz_title?.toLowerCase().includes(s));
  }
  return list;
}
