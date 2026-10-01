import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpQuizApi, createHttpApi } from "../src/services/api/httpApi";
import { MockQuizApi, createMockApi } from "../src/services/api/mockApi";
import { quizApi } from "../src/services/api/index";

describe("HttpQuizApi Service Client", () => {
  let api: HttpQuizApi;

  beforeEach(() => {
    vi.restoreAllMocks();
    api = new HttpQuizApi("http://localhost:8000");
  });

  it("creates instance via createHttpApi factory", () => {
    const factoryApi = createHttpApi();
    expect(factoryApi).toBeInstanceOf(HttpQuizApi);
  });

  it("fetches topics successfully", async () => {
    const mockTopics = [
      {
        id: "top-1",
        name: "System Design",
        slug: "system-design",
        quiz_count: 5,
      },
    ];
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTopics,
    });

    const result = await api.getTopics();
    expect(result).toEqual(mockTopics);
  });

  it("handles fetch failure gracefully when fetching topics", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await api.getTopics();
    expect(result).toEqual([]);
  });

  it("fetches topic detail with quizzes", async () => {
    const mockTopic = { id: "top-1", name: "System Design", quizzes: [] };
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTopic,
    });

    const result = await api.getTopic("system-design");
    expect(result).toEqual(mockTopic);
  });

  it("returns null when topic is not found", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await api.getTopic("non-existent");
    expect(result).toBeNull();
  });

  it("fetches quiz detail", async () => {
    const mockQuiz = { id: "quiz-1", title: "Distributed Caching" };
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockQuiz,
    });

    const result = await api.getQuiz("quiz-1");
    expect(result).toEqual(mockQuiz);
  });

  it("fetches attempt diagnostic result", async () => {
    const mockDiag = { attempt_id: "att-1", score_pct: 90 };
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDiag,
    });

    const result = await api.getAttemptResult("att-1");
    expect(result).toEqual(mockDiag);
  });

  it("submits quiz and returns diagnostics", async () => {
    const mockDiag = {
      attempt_id: "att-1",
      score_pct: 80,
      total_questions: 10,
      correct_answers: 8,
      readiness_level: "FAANG Ready",
    };
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDiag,
    });

    const result = await api.submitQuiz({
      quiz_id: "quiz-1",
      responses: [],
      time_spent_seconds: 120,
    });
    expect(result.score_pct).toBe(80);
  });

  it("handles purchaseItem and isItemPurchased", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ purchased: true }),
    });

    const purchased = await api.purchaseItem("quiz-1");
    expect(purchased).toBe(true);

    const isPurchased = await api.isItemPurchased("quiz-1");
    expect(isPurchased).toBe(true);
  });
});

describe("MockQuizApi and DelegatingQuizApi", () => {
  it("creates mock api instance via factory", () => {
    const mockApi = createMockApi();
    expect(mockApi).toBeInstanceOf(MockQuizApi);
  });

  it("delegates methods to webMockStore in MockQuizApi", async () => {
    const mock = createMockApi();
    const topics = await mock.getTopics();
    expect(Array.isArray(topics)).toBe(true);

    await mock.getTopic("system-design");
    await mock.getQuiz("quiz-1");
    await mock.getAttemptResult("att-1");
    await mock.isItemPurchased("quiz-1");
    await mock.purchaseItem("quiz-1");
  });

  it("delegates to current active client through delegating quizApi", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "top-1",
          name: "System Design",
          slug: "system-design",
          quiz_count: 5,
        },
      ],
    });

    const topics = await quizApi.getTopics();
    expect(Array.isArray(topics)).toBe(true);

    await quizApi.getTopic("system-design");
    await quizApi.getQuiz("quiz-1");
    await quizApi.getAttemptResult("att-1");
    await quizApi.purchaseItem("quiz-1");
    await quizApi.isItemPurchased("quiz-1");
  });
});
