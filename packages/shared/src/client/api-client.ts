/**
 * FastQuiz Typed API Client
 * Mirrors docs/api_contract.md
 */

import type {
  ApiErrorResponse,
  AuthResponse,
  CreateCheckoutSessionResponse,
  LoginRequest,
  PurchaseHistoryResponse,
  QuizDetail,
  QuizSummary,
  RegisterRequest,
  ReviewQuestionRequest,
  StartQuizResponse,
  SubmitAttemptRequest,
  AttemptResultResponse,
  TopicSummary,
  UserProfileResponse,
  Question,
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
    };
  }

  public setAccessToken(token: string | null): void {
    this.token = token;
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
    listPendingQuestions: (): Promise<Question[]> => {
      return this.request<Question[]>(this.config.quizBaseUrl!, '/admin/questions?status=pending');
    },

    reviewQuestion: (questionId: UUID, data: ReviewQuestionRequest): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(this.config.quizBaseUrl!, `/admin/questions/${questionId}/review`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
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
