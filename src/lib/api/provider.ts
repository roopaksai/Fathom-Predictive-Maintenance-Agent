import type { AssessInput, Assessment } from "@/lib/types";
import { derive, round, uid } from "@/lib/derived";
import { healthFromProbability, riskFromProbability, priorityFromProbability, FAILURE_MODES } from "@/lib/domain";
import { GradioLiveData, LiveError, parseGradioOutputs, postAssess, streamAssess } from "@/lib/api/gradio";
import { simulateAssessment } from "@/lib/api/fallback";
import { apiBase, useSimulated } from "@/lib/config";

export type ConnectionStatus = "checking" | "live" | "simulated" | "offline";

export interface Connection {
  status: ConnectionStatus;
  message?: string;
}

export async function probeConnection(): Promise<Connection> {
  const base = apiBase();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${base}/gradio_api/info`, { signal: ctrl.signal });
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
  const forced = useSimulated();
  if (forced) {
    const sim = simulateAssessment(input);
    return {
      assessment: buildAssessment(input, simDataToGradio(sim), "simulated"),
      connection: { status: "simulated", message: "Simulation enabled — point live in Settings to use the shared model." },
    };
  }

  const base = apiBase();
  try {
    const eventId = await postAssess(base, input);
    const outputs = await streamAssess(base, eventId);
    const data: GradioLiveData = parseGradioOutputs(input, outputs);
    return {
      assessment: buildAssessment(input, data, "live"),
      connection: { status: "live", message: `Connected to ${base}` },
    };
  } catch (e) {
    const detail = e instanceof LiveError ? e.message : e instanceof Error ? e.message : "Unknown backend error";
    const title = e instanceof LiveError && e.title ? e.title : "Backend error";
    const sim = simulateAssessment(input);
    return {
      assessment: buildAssessment(input, simDataToGradio(sim), "simulated"),
      connection: { status: "simulated", message: `${title}: ${detail}` },
    };
  }
}

function simDataToGradio(sim: ReturnType<typeof simulateAssessment>): GradioLiveData {
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

function buildAssessment(input: AssessInput, data: GradioLiveData, source: "live" | "simulated"): Assessment {
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

  const primary = data.modes.find((m) => m.code !== "NONE");
  const modeCode = primary?.code ?? "NONE";
  const modeName = primary?.name ?? FAILURE_MODES.NONE.name;
  const mode = { code: modeCode, name: modeName, probability: primary?.probability, confidence: primary?.confidence, note: primary?.note };

  const evidence = data.evidence.length
    ? data.evidence
    : modeCode === "NONE"
      ? ["No condition evidence triggered — all monitored signals within bounds."]
      : [FAILURE_MODES[modeCode].indicator];

  const explanation = data.explanation || (modeCode === "NONE" ? "No dominant degradation driver detected." : `Primary driver: ${evidence[0]}`);
  const recommendation =
    data.recommendation || (modeCode === "NONE" ? FAILURE_MODES.NONE.action : FAILURE_MODES[modeCode].action);
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

export type { GradioLiveData };