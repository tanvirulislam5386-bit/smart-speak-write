/**
 * AI transport configuration.
 *
 * Only non-secret, public values live here. Credentials for the AI model stay
 * on the FastAPI side; the browser only ever calls that backend.
 */
export const AI_CONFIG = {
  /** Flip to false (or set VITE_AI_USE_MOCKS=false) once FastAPI is live. */
  useMocks: (import.meta.env["VITE_AI_USE_MOCKS"] ?? "true") !== "false",
  /** e.g. https://api.example.com — no key, no token. */
  baseUrl: import.meta.env["VITE_AI_API_BASE_URL"] ?? "",
  /** Simulated latency for mock calls, so loading states are real. */
  mockLatencyMs: 700,
  modelLabel: "mock-evaluator-v1",
} as const;

export const AI_ENDPOINTS = {
  writingEvaluation: "/ai/writing/evaluate",
  speakingEvaluation: "/ai/speaking/evaluate",
  coach: "/ai/coach/message",
  mistakeAnalysis: "/ai/mistakes/analyze",
  studyPlan: "/ai/study-plan/generate",
  vocabulary: "/ai/vocabulary/generate",
  grammarExercises: "/ai/grammar/exercises",
} as const;

export type AIEndpointKey = keyof typeof AI_ENDPOINTS;
