import { AI_CONFIG, AI_ENDPOINTS, type AIEndpointKey } from "./config";
import type { AIErrorShape, AIResponse } from "./types";

export class AIError extends Error implements AIErrorShape {
  status: AIErrorShape["status"];
  code: AIErrorShape["code"];
  retryable: boolean;

  constructor(shape: AIErrorShape) {
    super(shape.message);
    this.name = "AIError";
    this.status = shape.status;
    this.code = shape.code;
    this.retryable = shape.retryable;
  }
}

function classify(status: number): Pick<AIErrorShape, "code" | "retryable"> {
  if (status === 400) return { code: "bad_request", retryable: false };
  if (status === 401) return { code: "unauthorized", retryable: false };
  if (status === 402) return { code: "payment_required", retryable: false };
  if (status === 403) return { code: "forbidden", retryable: false };
  if (status === 429) return { code: "rate_limited", retryable: true };
  if (status >= 500) return { code: "server_error", retryable: true };
  return { code: "bad_request", retryable: false };
}

const requestId = () =>
  `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function envelope<T>(data: T, source: "mock" | "api", latencyMs: number): AIResponse<T> {
  return {
    data,
    meta: {
      requestId: requestId(),
      model: AI_CONFIG.modelLabel,
      source,
      createdAt: new Date().toISOString(),
      latencyMs,
    },
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Single transport seam for every AI feature.
 *
 * Today: resolves the mock generator.
 * Later: POSTs to FastAPI at AI_ENDPOINTS[endpoint] and returns the same shape.
 */
export async function callAI<TRequest, TResult>(
  endpoint: AIEndpointKey,
  payload: TRequest,
  mock: (payload: TRequest) => TResult,
  options?: { signal?: AbortSignal },
): Promise<AIResponse<TResult>> {
  const startedAt = Date.now();

  if (AI_CONFIG.useMocks || !AI_CONFIG.baseUrl) {
    await wait(AI_CONFIG.mockLatencyMs);
    if (options?.signal?.aborted) {
      throw new AIError({
        status: 499,
        code: "network_error",
        message: "Request cancelled.",
        retryable: true,
      });
    }
    return envelope(mock(payload), "mock", Date.now() - startedAt);
  }

  let response: Response;
  try {
    response = await fetch(`${AI_CONFIG.baseUrl}${AI_ENDPOINTS[endpoint]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
      signal: options?.signal,
    });
  } catch {
    throw new AIError({
      status: 0,
      code: "network_error",
      message: "Could not reach the evaluation service. Check your connection and try again.",
      retryable: true,
    });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AIError({
      status: response.status,
      ...classify(response.status),
      message: detail || `Evaluation service returned ${response.status}.`,
    });
  }

  const body = (await response.json()) as TResult | AIResponse<TResult>;
  const data = (body as AIResponse<TResult>)?.data ?? (body as TResult);
  return envelope(data, "api", Date.now() - startedAt);
}
