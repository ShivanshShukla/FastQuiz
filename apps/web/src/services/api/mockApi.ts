import type {
  DiagnosticResult,
  QuizApiService,
  QuizData,
  QuizSubmission,
  TopicData,
} from "./types";

/**
 * Mock implementation of QuizApiService.
 * Dynamically delegates to the local WebMockStore.
 */
export class MockQuizApi implements QuizApiService {
  private async getStore() {
    const { webMockStore } = await import("../webMockStore");
    return webMockStore;
  }

  async getTopics(): Promise<TopicData[]> {
    const store = await this.getStore();
    return store.getTopics();
  }

  async getTopic(slugOrId: string): Promise<TopicData | null> {
    const store = await this.getStore();
    return store.getTopic(slugOrId) || null;
  }

  async getQuiz(quizId: string): Promise<QuizData | null> {
    const store = await this.getStore();
    return store.getQuiz(quizId) || null;
  }

  async getAttemptResult(attemptId: string): Promise<DiagnosticResult | null> {
    const store = await this.getStore();
    return store.getAttemptResult(attemptId) || null;
  }

  async submitQuiz(submission: QuizSubmission): Promise<DiagnosticResult> {
    const store = await this.getStore();
    return store.submitAttempt(
      submission as unknown as Parameters<typeof store.submitAttempt>[0],
    ) as unknown as DiagnosticResult;
  }

  async purchaseItem(itemId: string): Promise<boolean> {
    const store = await this.getStore();
    return store.purchaseItem(itemId);
  }

  async isItemPurchased(itemId: string): Promise<boolean> {
    const store = await this.getStore();
    return store.isItemPurchased(itemId);
  }
}

export const createMockApi = (): QuizApiService => new MockQuizApi();
