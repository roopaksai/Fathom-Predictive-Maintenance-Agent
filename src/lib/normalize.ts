import type {
  Assessment,
  AssessInput,
  FailureModeCode,
  HealthStatus,
  RiskLevel,
  Source,
} from "@/lib/types";
import { derive, round, clampP, uid } from "@/lib/derived";
import { FAILURE_MODES, healthFromProbability, riskFromProbability, priorityFromProbability } from "@/lib/domain";

/**
 * Backend interoperability helpers.
 *
 * The shared FastAPI backend (Railway) returns assessment data in
 * snake_case ("Gradio JSON component" schema):
 *   failure_probability, health_status, risk_level, likely_failure_modes,
 *   contributing_features, condition_evidence, recommended_maintenance_action,
 *   decision_threshold, anomaly_percentile, model_version, latency_ms,
 *   decision_support_notice.
 *
 * These helpers convert that shape into the camelCase Assessment used
 * throughout the frontend.
 */

export function mapHealthStatus(s: string | undefined, p: number): HealthStatus {
  if (s && typeof s === "string") {
    const norm = s.trim().toLowerCase();
    if (norm.includes("critic")) return "Critical";
    if (norm.includes("high") || norm.includes("elevated")) return "High Risk";
    if (norm.includes("warn") || norm.includes("moderate") || norm.includes("medium")) return "Warning";
    if (norm.includes("normal") || norm.includes("healthy") || norm.includes("ok")) return "Normal";
  }
  return healthFromProbability(clampP(Number.isFinite(p) ? p : 0));
}

export function mapRiskLevel(s: string | undefined, p: number): RiskLevel {
  if (s && typeof s === "string") {
    const norm = s.trim().toLowerCase();
    if (norm.includes("critic")) return "Critical";
    if (norm.includes("high")) return "High";
    if (norm.includes("medium")) return "Medium";
    if (norm.includes("low")) return "Low";
  }
  return riskFromProbability(clampP(Number.isFinite(p) ? p : 0));
}

export function mapSource(s: string | undefined): Source {
  if (s === "fastapi" || s === "gradio" || s === "live" || s === "simulated") return s;
  return "simulated";
}

export function mapDecisionThreshold(data: any): number {
  return typeof data.decision_threshold === "number" ? data.decision_threshold : 0.28;
}

/** Convert a backend snake_case sensor block into the frontend AssessInput shape. */
export function mapSensorInputs(inputs: any): AssessInput {
  const fallback: AssessInput = {
    productType: "M",
    airTemp: NaN,
    processTemp: NaN,
    speed: NaN,
    torque: NaN,
    toolWear: NaN,
    machineId: "UNKNOWN",
    state: "RUNNING",
  };
  if (!inputs || typeof inputs !== "object") return fallback;
  const toNum = (v: any) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
  return {
    productType: (["L", "M", "H"] as const).includes(inputs.product_type)
      ? inputs.product_type
      : fallback.productType,
    airTemp: toNum(inputs.air_temperature),
    processTemp: toNum(inputs.process_temperature),
    speed: toNum(inputs.rotational_speed),
    torque: toNum(inputs.torque),
    toolWear: toNum(inputs.tool_wear),
    machineId: inputs.machine_id ?? fallback.machineId,
    state: inputs.state === "IDLE" ? "IDLE" : "RUNNING",
  };
}

/**
 * Map a snake_case payload (predict response OR the nested `prediction`
 * block of an assessment detail) into the camelCase shape expected by
 * buildAssessment().
 */
export function parseAssessmentPayload(data: any) {
  const failureProbability =
    typeof data.failure_probability === "number" ? data.failure_probability : 0;
  const decisionThreshold = mapDecisionThreshold(data);
  const noFailure =
    String(data.predicted_class ?? "").toUpperCase() === "NO FAILURE" ||
    (data.failure_mode == null && failureProbability < decisionThreshold);

  const modeEntries = (data.likely_failure_modes ?? data.failure_modes ?? [])
    .map((m: any) => {
      const probability =
        typeof m.probability === "number" ? m.probability : undefined;
      return {
        code: (m.mode ?? m.mode_code ?? "NONE") as FailureModeCode,
        name: m.name ?? m.mode_name,
        probability,
        confidence: probability ?? (typeof m.confidence === "number" ? m.confidence : undefined),
        note: m.limitation ?? m.note,
      };
    });

  return {
    failureProbability,
    healthStatus: data.health_status,
    riskLevel: data.risk_level,
    modes: noFailure ? [] : modeEntries,
    contributing: (data.contributing_features ?? []).map((f: any) => ({
      key: f.feature,
      label: f.label ?? f.feature,
      value: f.value,
      unit: f.units ?? "failure probability contribution",
      magnitude: f.magnitude ?? Math.abs(f.contribution ?? 0),
      direction:
        typeof f.direction === "string" && f.direction.startsWith("increases")
          ? "increases"
          : typeof f.sign === "number" && f.sign < 0
            ? "decreases"
            : "decreases",
    })),
    evidence:
      Array.isArray(data.condition_evidence) && data.condition_evidence.length
        ? data.condition_evidence.map((e: any) => {
            const measuredText =
              e.measured && Object.keys(e.measured).length
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
    decisionThreshold,
    anomalyPercentile:
      typeof data.anomaly_percentile === "number"
        ? (data.anomaly_percentile > 1 ? data.anomaly_percentile : data.anomaly_percentile * 100)
        : data.anomaly_percentile,
    modelVersion: data.model_version,
    latencyMs: data.latency_ms,
    notice: data.decision_support_notice,
  };
}

/** Build a full Assessment from already-normalized (camelCase) result data. */
export function buildAssessment(
  input: AssessInput,
  data: any,
  source: Source,
): Assessment {
  const probability = round(Math.max(0, Math.min(1, data.failureProbability ?? 0)), 4);
  const healthStatus = mapHealthStatus(data.healthStatus, probability);
  const riskLevel = mapRiskLevel(data.riskLevel, probability);

  const modes = Array.isArray(data.modes) ? data.modes : [];
  const primary = modes.find((m: any) => m.code !== "NONE");
  const modeCode = (primary?.code ?? "NONE") as FailureModeCode;
  const modeName = primary?.name ?? FAILURE_MODES.NONE.name;
  const mode = {
    code: modeCode,
    name: modeName,
    probability: primary?.probability,
    confidence: primary?.confidence,
    note: primary?.note,
  };

  const getMode = (code: FailureModeCode) =>
    FAILURE_MODES[code] ?? FAILURE_MODES.NONE;

  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const contributing = Array.isArray(data.contributing) ? data.contributing : [];

  const explanation =
    data.explanation ||
    (modeCode === "NONE"
      ? "No dominant degradation driver detected."
      : `Primary driver: ${evidence[0] ?? getMode(modeCode).indicator}`);

  const recommendation =
    data.recommendation ||
    (modeCode === "NONE" ? getMode("NONE").action : getMode(modeCode).action);

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
    modes,
    anomalyPercentile: data.anomalyPercentile,
    contributing,
    evidence,
    explanation,
    recommendation,
    priority: priorityFromProbability(probability),
    modelVersion: data.modelVersion,
    latencyMs: data.latencyMs,
    notice: data.notice,
  };
}

/** Convert a full assessment detail ({inputs, prediction, ...}) to an Assessment. */
export function assessmentFromDetail(detail: any): Assessment {
  const input = mapSensorInputs(detail.inputs);
  const data = parseAssessmentPayload(detail.prediction ?? detail);
  const assessment = buildAssessment(input, data, mapSource(detail.source));
  return {
    ...assessment,
    id: detail.id ?? assessment.id,
    ts: detail.ts ?? assessment.ts,
    source: mapSource(detail.source),
    inputs: input.machineId ? { ...input, machineId: input.machineId } : input,
  };
}

/** Convert a sparse list summary row into a best-effort Assessment. */
export function assessmentFromSummary(summary: any): Assessment {
  const probability = clampP(Number.isFinite(summary.failure_probability) ? summary.failure_probability : 0);
  const healthStatus = mapHealthStatus(summary.health_status, probability);
  const riskLevel = mapRiskLevel(summary.risk_level, probability);
  const predicted = String(summary.predicted_class ?? "").toUpperCase();
  const nominal = !predicted || predicted === "NO FAILURE";
  const code = (nominal ? "NONE" : (summary.failure_mode ?? summary.predicted_class)) as FailureModeCode;
  const mode = {
    code,
    name: FAILURE_MODES[code]?.name ?? FAILURE_MODES.NONE.name,
  };

  return {
    id: summary.id ?? uid("asmt"),
    ts: summary.ts ?? new Date().toISOString(),
    source: mapSource(summary.source),
    inputs: {
      productType: "M",
      airTemp: NaN,
      processTemp: NaN,
      speed: NaN,
      torque: NaN,
      toolWear: NaN,
      machineId: summary.machine_id ?? "UNKNOWN",
      state: "RUNNING",
    },
    derived: { tempDifference: NaN, mechanicalPower: NaN, overstrain: NaN },
    failureProbability: probability,
    threshold: 0.28,
    healthStatus,
    riskLevel,
    mode,
    modes: [],
    anomalyPercentile: summary.anomaly_percentile,
    contributing: [],
    evidence: [],
    explanation:
      code === "NONE"
        ? "The predictive model does not currently indicate a machine failure."
        : `${mode.name} indicated with ~${(probability * 100).toFixed(1)}% failure probability.`,
    recommendation:
      code === "NONE"
        ? "No immediate maintenance action is indicated. Continue monitoring the machine."
        : FAILURE_MODES[code]?.action ?? "Request a maintenance review of the operating condition and sensor readings.",
    priority: priorityFromProbability(probability),
  };
}

/**
 * Normalize any backend assessment payload (list summary or full detail)
 * into the frontend Assessment shape.
 */
export function normalizeBackendItem(item: any): Assessment {
  if (!item || typeof item !== "object") {
    return assessmentFromSummary({});
  }
  if (item.prediction) {
    const detailed = assessmentFromDetail(item);
    return detailed;
  }
  return assessmentFromSummary(item);
}