import { isMockEnabled } from "../../config/env";
import { createHttpApi } from "./httpApi";
import type {
  DiagnosticResult,
  QuizApiService,
  QuizData,
  QuizSubmission,
  TopicData,
} from "./types";

export * from "./types";

/**
 * Single seam API client instance for FastQuiz.
 * Delegates dynamically to MockQuizApi when mock mode is enabled (dev/test only),
 * or HttpQuizApi in authentic production mode.
 *
 * Guarded by import.meta.env.DEV || VITE_MOCK_ON === 'true' so Rollup completely
 * tree-shakes MockQuizApi and webMockStore out of production bundles.
 */
class DelegatingQuizApi implements QuizApiService {
  private mockApi?: QuizApiService;
  private httpApi?: QuizApiService;

  private async getDelegate(): Promise<QuizApiService> {
    if (
      import.meta.env.DEV ||
      import.meta.env.VITE_MOCK_ON === "true" ||
      import.meta.env.MODE === "test"
    ) {
      if (isMockEnabled()) {
        if (!this.mockApi) {
          const { createMockApi } = await import("./mockApi");
          this.mockApi = createMockApi();
        }
        return this.mockApi;
      }
    }
    if (!this.httpApi) this.httpApi = createHttpApi();
    return this.httpApi;
  }

  async getTopics(): Promise<TopicData[]> {
    const delegate = await this.getDelegate();
    return delegate.getTopics();
  }

  async getTopic(slugOrId: string): Promise<TopicData | null> {
    const delegate = await this.getDelegate();
    return delegate.getTopic(slugOrId);
  }

  async getQuiz(quizId: string): Promise<QuizData | null> {
    const delegate = await this.getDelegate();
    return delegate.getQuiz(quizId);
  }

  async getAttemptResult(attemptId: string): Promise<DiagnosticResult | null> {
    const delegate = await this.getDelegate();
    return delegate.getAttemptResult(attemptId);
  }

  async submitQuiz(submission: QuizSubmission): Promise<DiagnosticResult> {
    const delegate = await this.getDelegate();
    return delegate.submitQuiz(submission);
  }

  async purchaseItem(itemId: string): Promise<boolean> {
    const delegate = await this.getDelegate();
    return delegate.purchaseItem(itemId);
  }

  async isItemPurchased(itemId: string): Promise<boolean> {
    const delegate = await this.getDelegate();
    return delegate.isItemPurchased(itemId);
  }
}

export const quizApi: QuizApiService = new DelegatingQuizApi();
