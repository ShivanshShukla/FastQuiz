import { FastQuizClient } from "@fastquiz/shared";
import { webMockStore } from "./webMockStore";

const isMockOn =
  import.meta.env.VITE_MOCK_ON === "true" ||
  import.meta.env.MODE === "development";

export const apiClient = new FastQuizClient({
  baseUrl: "",
  authBaseUrl: "/auth",
  quizBaseUrl: "/quiz",
  paymentsBaseUrl: "/purchases",
  getAccessToken: () => localStorage.getItem("fastquiz_access_token"),
  useMockFallback: true,
});

export { webMockStore, isMockOn };
