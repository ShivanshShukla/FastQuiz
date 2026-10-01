import type {
  DiagnosticResult,
  QuizApiService,
  QuizData,
  QuizSubmission,
  TopicData,
} from "./types";

/**
 * Production implementation of QuizApiService.
 * Communicates with backend microservices over HTTP.
 */
export class HttpQuizApi implements QuizApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  async getTopics(): Promise<TopicData[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/curriculum/topics`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async getTopic(slugOrId: string): Promise<TopicData | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/curriculum/topics/${encodeURIComponent(slugOrId)}`,
        {
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getQuiz(quizId: string): Promise<QuizData | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/quizzes/${encodeURIComponent(quizId)}`,
        {
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getAttemptResult(attemptId: string): Promise<DiagnosticResult | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/attempts/${encodeURIComponent(attemptId)}/results`,
        {
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<DiagnosticResult> {
    const res = await fetch(
      `${this.baseUrl}/api/quizzes/${encodeURIComponent(submission.quizId)}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submission),
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to submit quiz attempt (status ${res.status})`);
    }
    return await res.json();
  }

  async purchaseItem(itemId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ item_id: itemId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async isItemPurchased(itemId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/purchases/check/${encodeURIComponent(itemId)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.purchased;
    } catch {
      return false;
    }
  }
}

export const createHttpApi = (): QuizApiService => new HttpQuizApi();
