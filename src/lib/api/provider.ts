import type { AssessInput, Assessment } from "@/lib/types";
import { simulateAssessment } from "@/lib/api/fallback";
import { api } from "@/lib/api/client";
import { apiBase } from "@/lib/config";
import { buildAssessment, parseAssessmentPayload } from "@/lib/normalize";

export type ConnectionStatus = "checking" | "live" | "simulated" | "offline";

export interface Connection {
  status: ConnectionStatus;
  message?: string;
}

export async function probeConnection(): Promise<Connection> {
  const base = apiBase();
  const attempt = (path: string, timeoutMs: number): Promise<Response> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    return fetch(`${base}${path}`, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
  };
  const legacyFallback = async (): Promise<Connection | null> => {
    try {
      const res = await attempt("/health", 6000);
      if (res.ok) return { status: "live", message: `Connected to ${base} (legacy health endpoint)` };
    } catch {
      /* fall through to offline */
    }
    return null;
  };
  try {
    const res = await attempt("/api/v1/health", 8000);
    if (res.ok) return { status: "live", message: `Connected to ${base}` };
    const fallback = await legacyFallback();
    if (fallback) return fallback;
    return { status: "offline", message: `Backend responded ${res.status}` };
  } catch (e) {
    const fallback = await legacyFallback();
    if (fallback) return fallback;
    return {
      status: "offline",
      message: e instanceof Error && e.name === "AbortError" ? "Backend unreachable (timeout)" : "Backend unreachable",
    };
  }
}

export interface RunResult {
  assessment: Assessment;
  connection: Connection;
}

export async function runAssessment(input: AssessInput): Promise<RunResult> {
  const baseUrl = apiBase();

  // Try FastAPI first
  try {
    const payload = (await api.predict(input)) as any;
    if (!payload || typeof payload !== "object") {
      throw new Error("Unexpected FastAPI predict payload");
    }
    const data =
      typeof payload.failure_probability === "number"
        ? parseAssessmentPayload(payload)
        : payload;
    return {
      assessment: buildAssessment(input, data, "live"),
      connection: { status: "live", message: `Connected to ${baseUrl} (FastAPI)` },
    };
  } catch (fastApiError) {
    console.warn("FastAPI prediction failed, trying Gradio:", fastApiError);
  }

  // Try Gradio as fallback
  try {
    const eventId = await postAssess(input);
    const outputs = await streamAssess(eventId);
    const data = parseGradioOutputs(input, outputs);
    return {
      assessment: buildAssessment(input, data, "live"),
      connection: { status: "live", message: `Connected to ${baseUrl} (Gradio fallback)` },
    };
  } catch (gradioError) {
    console.warn("Gradio prediction failed, using simulated:", gradioError);
  }

  // Final fallback: simulated
  const sim = simulateAssessment(input);
  return {
    assessment: buildAssessment(input, simDataToGradio(sim), "simulated"),
    connection: { status: "simulated", message: "Using simulated engine â€” backend unavailable" },
  };
}

function simDataToGradio(sim: ReturnType<typeof simulateAssessment>) {
  return {
    failureProbability: sim.failureProbability,
    healthStatus: sim.healthStatus,
    riskLevel: sim.riskLevel,
    modes: sim.modes,
    contributing: sim.contributing,
    evidence: sim.evidence,
    explanation: sim.explanation,
    recommendation: sim.recommendation,
    decisionThreshold: sim.threshold,
    anomalyPercentile: sim.anomalyPercentile,
    modelVersion: sim.modelVersion,
    latencyMs: sim.latencyMs,
    notice: sim.notice,
  };
}

// Gradio fallback functions
const GRADIO_API_URL = "https://vvsgyuv123-predictive-maintenance-demo.hf.space/gradio_api";

async function postAssess(input: AssessInput): Promise<string> {
  const res = await fetch(`${GRADIO_API_URL}/call/v2/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_type: input.productType,
      air: input.airTemp,
      process: input.processTemp,
      speed: input.speed,
      torque: input.torque,
      wear: input.toolWear,
      machine: input.machineId || "DEMO-001",
    }),
  });
  if (!res.ok) throw new Error(`Gradio call failed: ${res.status}`);
  const json = await res.json();
  const eventId = json.event_id;
  if (!eventId) throw new Error("No event_id from Gradio");
  return eventId;
}

async function streamAssess(eventId: string): Promise<any[]> {
  const res = await fetch(`${GRADIO_API_URL}/call/v2/assess/${eventId}`, {
    headers: { Accept: "text/event-stream" },
  });
  if (!res.ok) throw new Error(`Gradio stream failed: ${res.status}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  const outputs: any[] = [];
  let buffer = "";
  let sawError = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line === "event: error") {
        sawError = true;
      }
      if (line.startsWith("data: ")) {
        try {
          if (sawError) {
            const err = JSON.parse(line.slice(6));
            throw new Error(err.error ?? "Gradio space error");
          }
          const parsed = JSON.parse(line.slice(6));
          if (Array.isArray(parsed)) {
            outputs.push(...parsed);
          } else if (parsed.msg === "process_completed") {
            // Legacy Gradio format fallback
            outputs.push(...parsed.output?.data ?? []);
          }
        } catch (e) {
          if (e instanceof Error && !(e instanceof SyntaxError)) throw e;
          // Ignore JSON parse errors
        }
      }
    }
  }
  return outputs;
}

function parseGradioOutputs(input: AssessInput, outputs: any[]) {
  if (!outputs.length) throw new Error("No outputs from Gradio");
  const data = outputs[15]; // "Full model response" (Json component, index 15 of 17)
  if (!data || typeof data !== "object") {
    throw new Error("Full model response missing from Gradio output");
  }
  return parseAssessmentPayload(data);
}

export type { Assessment };
