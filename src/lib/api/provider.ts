import type { AssessInput, Assessment, FailureModeCode } from "@/lib/types";
import { derive, round, uid } from "@/lib/derived";
import { healthFromProbability, riskFromProbability, priorityFromProbability, FAILURE_MODES } from "@/lib/domain";
import { simulateAssessment } from "@/lib/api/fallback";
import { api } from "@/lib/api/client";
import { apiBase } from "@/lib/config";

export type ConnectionStatus = "checking" | "live" | "simulated" | "offline";

export interface Connection {
  status: ConnectionStatus;
  message?: string;
}

export async function probeConnection(): Promise<Connection> {
  try {
    const base = apiBase();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${base}/api/v1/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return { status: "offline", message: `Backend responded ${res.status}` };
    return { status: "live", message: `Connected to ${base}` };
  } catch (e) {
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
    const assessment = await api.predict(input);
    return {
      assessment: normalizeAssessment(assessment),
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
    connection: { status: "simulated", message: "Using simulated engine — backend unavailable" },
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

function normalizeHealth(s: string | undefined, p: number): Assessment["healthStatus"] {
  if (!s) return healthFromProbability(p);
  const norm = s.trim().toLowerCase();
  if (norm.includes("critic")) return "Critical";
  if (norm.includes("high") || norm.includes("elevated")) return "High Risk";
  if (norm.includes("warn") || norm.includes("moderate") || norm.includes("medium")) return "Warning";
  if (norm.includes("normal") || norm.includes("healthy") || norm.includes("ok")) return "Normal";
  return healthFromProbability(p);
}

function normalizeAssessment(assessment: Assessment): Assessment {
  return {
    ...assessment,
    healthStatus: normalizeHealth(assessment.healthStatus, assessment.failureProbability),
    riskLevel: assessment.riskLevel
      ? (assessment.riskLevel.trim().toLowerCase().includes("critic")
          ? "Critical"
          : assessment.riskLevel.trim().toLowerCase().includes("high")
            ? "High"
            : assessment.riskLevel.trim().toLowerCase().includes("medium")
              ? "Medium"
              : assessment.riskLevel.trim().toLowerCase().includes("low")
                ? "Low"
                : riskFromProbability(assessment.failureProbability))
      : riskFromProbability(assessment.failureProbability),
    priority: priorityFromProbability(assessment.failureProbability),
  };
}

function buildAssessment(input: AssessInput, data: any, source: "live" | "simulated"): Assessment {
  const probability = round(Math.max(0, Math.min(1, data.failureProbability ?? 0)), 4);
  const healthStatus = normalizeHealth(data.healthStatus, probability);
  const riskLevel = data.riskLevel
    ? (data.riskLevel.trim().toLowerCase().includes("critic")
        ? "Critical"
        : data.riskLevel.trim().toLowerCase().includes("high")
          ? "High"
          : data.riskLevel.trim().toLowerCase().includes("medium")
            ? "Medium"
            : data.riskLevel.trim().toLowerCase().includes("low")
              ? "Low"
              : riskFromProbability(probability))
    : riskFromProbability(probability);

  const primary = data.modes.find((m: any) => m.code !== "NONE");
  const modeCode = (primary?.code ?? "NONE") as FailureModeCode;
  const modeName = primary?.name ?? FAILURE_MODES.NONE.name;
  const mode = { code: modeCode, name: modeName, probability: primary?.probability, confidence: primary?.confidence, note: primary?.note };

  const getMode = (code: FailureModeCode) => FAILURE_MODES[code];

  const evidence = data.evidence.length
    ? data.evidence
    : modeCode === "NONE"
      ? ["No condition evidence triggered — all monitored signals within bounds."]
      : [getMode(modeCode).indicator];

  const explanation = data.explanation || (modeCode === "NONE" ? "No dominant degradation driver detected." : `Primary driver: ${evidence[0]}`);
  const recommendation = data.recommendation || (modeCode === "NONE" ? getMode("NONE").action : getMode(modeCode).action);
  const priority = priorityFromProbability(probability);

  return {
    id: uid("asmt"),
    ts: new Date().toISOString(),
    source,
    inputs: { ...input },
    derived: derive(input),
    failureProbability: probability,
    threshold: data.decisionThreshold ?? 0.5,
    healthStatus,
    riskLevel,
    mode,
    modes: data.modes,
    anomalyPercentile: data.anomalyPercentile,
    contributing: data.contributing,
    evidence,
    explanation,
    recommendation,
    priority: priority as Assessment["priority"],
    modelVersion: data.modelVersion,
    latencyMs: data.latencyMs,
    notice: data.notice,
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
  return {
    failureProbability: data.failure_probability,
    healthStatus: data.health_status,
    riskLevel: data.risk_level,
    modes: (data.likely_failure_modes ?? data.failure_modes)?.map((m: any) => ({
      code: m.mode ?? m.mode_code,
      name: m.name ?? m.mode_name,
      probability: m.probability,
      confidence: m.score_kind ?? m.confidence,
      note: m.limitation ?? m.note,
    })) ?? [],
    contributing: (data.contributing_features ?? []).map((f: any) => ({
      key: f.feature,
      label: f.feature,
      value: f.value,
      unit: f.units ?? "failure probability contribution",
      magnitude: Math.abs(f.contribution ?? 0),
      direction: typeof f.direction === "string" && f.direction.startsWith("increases")
        ? "increases"
        : "decreases",
    })),
    evidence: Array.isArray(data.condition_evidence) && data.condition_evidence.length
      ? data.condition_evidence.map((e: any) => {
          const measuredText = e.measured && Object.keys(e.measured).length
            ? Object.entries(e.measured)
                .map(([k, v]) => `${k}=${typeof v === "number" ? v.toPrecision(4) : v}`)
                .join("; ")
            : "n/a";
          return `${e.mode} (${e.kind ?? "evidence"}): ${e.rule} - triggered=${e.triggered} - measured: ${measuredText}`;
        })
      : data.evidence ?? [],
    explanation: data.explanation,
    recommendation: Array.isArray(data.recommended_maintenance_action)
      ? data.recommended_maintenance_action.join(" ")
      : data.recommended_maintenance_action,
    decisionThreshold: data.decision_threshold,
    anomalyPercentile: typeof data.anomaly_percentile === "number"
      ? (data.anomaly_percentile > 1 ? data.anomaly_percentile : data.anomaly_percentile * 100)
      : data.anomaly_percentile,
    modelVersion: data.model_version,
    latencyMs: data.latency_ms,
    notice: data.decision_support_notice,
    conditionEvidenceRaw: data.condition_evidence,
  };
}

export type { Assessment };