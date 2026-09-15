import type { FailureModeOutcome } from "@/lib/types";
import type {
  FailureModeCode,
  HealthStatus,
  ProductType,
  RecommendationEffort,
  RecommendationOption,
  RecommendationSource,
  RecommendationUrgency,
  RiskLevel,
  Severity,
} from "@/lib/types";
export const FAILURE_MODES: Record<
  FailureModeCode,
  { code: FailureModeCode; name: string; cause: string; indicator: string; action: string }
> = {
  TWF: {
    code: "TWF",
    name: "Tool Wear Failure",
    cause: "Gradual tool degradation from accumulated cutting stress.",
    indicator: "Tool wear minutes climbing toward the material limit.",
    action: "Inspect or replace the tool and recalibrate feed.",
  },
  HDF: {
    code: "HDF",
    name: "Heat Dissipation Failure",
    cause: "Cooling or process-heat balance degraded.",
    indicator: "Process temperature approaching air temperature margins.",
    action: "Check coolant flow; verify thermal isolation and airflow.",
  },
  PWF: {
    code: "PWF",
    name: "Power Failure",
    cause: "Motor load or electrical power draw beyond rated envelope.",
    indicator: "Torque × rotational speed indicating abnormal mechanical power.",
    action: "Inspect drive and motor; reduce load until verified.",
  },
  OSF: {
    code: "OSF",
    name: "Overstrain Failure",
    cause: "Combined tool-wear and torque loading overstressing the spindle.",
    indicator: "Overstrain measure (tool wear × torque) above safe band.",
    action: "Reduce torque and schedule spindle inspection.",
  },
  RNF: {
    code: "RNF",
    name: "Random Failure",
    cause: "No dominant process driver — stochastic mechanical or electrical fault.",
    indicator: "Anomalous signature without a clear parameter driver.",
    action: "Schedule diagnostic inspection; monitor trend closely.",
  },
  NONE: {
    code: "NONE",
    name: "No Failure",
    cause: "Operating conditions within the nominal envelope.",
    indicator: "All parameters and derived measures within expected range.",
    action: "Continue routine monitoring; no intervention required.",
  },
};

export const FAILURE_MODE_LIST = Object.values(FAILURE_MODES) as FailureModeOutcome[] & { code: FailureModeCode }[];

export const PRODUCT_TYPES: ProductType[] = ["L", "M", "H"];

export function failureMode(code: string): FailureModeOutcome {
  const key = (Object.keys(FAILURE_MODES) as FailureModeCode[]).includes(code as FailureModeCode)
    ? (code as FailureModeCode)
    : "NONE";
  return { code: FAILURE_MODES[key].code, name: FAILURE_MODES[key].name };
}

/* ---- risk mapping -------------------------------------------------- */

export function healthFromProbability(p: number): HealthStatus {
  if (p >= 0.8) return "Critical";
  if (p >= 0.6) return "High Risk";
  if (p >= 0.35) return "Warning";
  return "Normal";
}

export function riskFromProbability(p: number): RiskLevel {
  if (p >= 0.8) return "Critical";
  if (p >= 0.6) return "High";
  if (p >= 0.35) return "Medium";
  return "Low";
}

export function severityFromProbability(p: number): Severity {
  if (p >= 0.8) return "Critical";
  if (p >= 0.6) return "High";
  return "Warning";
}

export function priorityFromProbability(p: number): Severity | "Routine" {
  if (p >= 0.8) return "Critical";
  if (p >= 0.6) return "High";
  if (p >= 0.35) return "Warning";
  return "Routine";
}

export function probabilityFromStatus(status: HealthStatus): number {
  switch (status) {
    case "Critical":
      return 0.85;
    case "High Risk":
      return 0.7;
    case "Warning":
      return 0.45;
    default:
      return 0.12;
  }
}

/* ---- persistence of failure modes -------------------------------- */

export function flattenModes(modes: FailureModeOutcome[]): FailureModeOutcome[] {
  return modes
    .filter((m) => m.code !== "NONE")
    .sort((a, b) => (b.probability ?? b.confidence ?? 0) - (a.probability ?? a.confidence ?? 0));
}

/* ---- recommendation catalog -------------------------------------- */
/* Deterministic top-4 builder. Always available — used when the LLM is
   unreachable or not configured, and as the validation floor for any
   options the reasoner returns. */

interface CatalogOptionSeed {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  effort: RecommendationEffort;
  priority: "Low" | "Medium" | "High" | "Critical";
  source: RecommendationSource;
}

const RECOMMENDATION_CATALOG: Record<string, CatalogOptionSeed[]> = {
  TWF: [
    { id: "twf-inspect", title: "Inspect & recalibrate the tool", summary: "Verify flute condition and reset feed calibration before resuming production.", rationale: "Tool wear is the dominant driver — a worn edge raises failure probability faster than any other single signal.", effort: "Next shift", priority: "High", source: "deterministic" },
    { id: "twf-replace", title: "Replace tooling", summary: "Swap to a fresh cutter; the current wear envelope is past the safe band.", rationale: "Wear minutes near the material limit — replacement removes the active contributor outright.", effort: "Immediate", priority: "Critical", source: "deterministic" },
    { id: "twf-monitor", title: "Monitor tool-wear trend", summary: "Keep the run under watch and log frequency after recalibration.", rationale: "Confirms whether wear is process-driven or a calibration artifact before deeper action.", effort: "This week", priority: "Medium", source: "deterministic" },
    { id: "twf-stop", title: "Stop & full inspection", summary: "Halt the line for a complete tool-path and spindle check.", rationale: "Highest-risk reserve option if evidence indicates compounding degradation.", effort: "Immediate", priority: "High", source: "deterministic" },
  ],
  HDF: [
    { id: "hdf-coolant", title: "Prime coolant & airflow", summary: "Verify coolant flow and clear any blocked thermal path.", rationale: "Process temperature is climbing toward air temperature — heat dissipation is the named driver.", effort: "Next shift", priority: "High", source: "deterministic" },
    { id: "hdf-verify", title: "Verify thermal sensors", summary: "Confirm process/air sensors read true before trusting the ΔT signal.", rationale: "A bad sensor reads like heat failure; eliminates instrumentation false positives.", effort: "This week", priority: "Medium", source: "deterministic" },
    { id: "hdf-isolate", title: "Isolate the heat source", summary: "Trace heat-generating components and measure hotspots directly.", rationale: "Narrows where the dissipation budget is failing.", effort: "Next planned stop", priority: "Medium", source: "deterministic" },
    { id: "hdf-monitor", title: "Monitor thermal margin", summary: "Watch the ΔT trend; escalate if the margin keeps eroding.", rationale: "Low-intervention follow-up that keeps the driver under surveillance.", effort: "This week", priority: "Low", source: "deterministic" },
  ],
  PWF: [
    { id: "pwf-power", title: "Inspect drive & motor", summary: "Check electrical power draw and drive health under load.", rationale: "Mechanical power is above the rated envelope — the named power-failure driver.", effort: "Next shift", priority: "High", source: "deterministic" },
    { id: "pwf-load", title: "Reduce load", summary: "Lower torque target until the mechanical-power band is restored.", rationale: "Directly pulls the power signal back inside the safe envelope.", effort: "Immediate", priority: "Critical", source: "deterministic" },
    { id: "pwf-torque", title: "Calibrate torque curve", summary: "Re-verify torque transducer calibration and speed-torque mapping.", rationale: "A miscalibrated transducer reads as a power anomaly.", effort: "This week", priority: "Medium", source: "deterministic" },
    { id: "pwf-monitor", title: "Trend output power", summary: "Track mechanical-power trend; escalate above threshold.", rationale: "Cheap ongoing surveillance of the primary indicator.", effort: "This week", priority: "Low", source: "deterministic" },
  ],
  OSF: [
    { id: "osf-spindle", title: "Inspect spindle & bearings", summary: "Check spindle and bearing state; schedule replacement if damaged.", rationale: "Overstrain = toolwear × torque loading the spindle beyond its safe band.", effort: "Immediate", priority: "High", source: "deterministic" },
    { id: "osf-torque", title: "Cut torque", summary: "Reduce torque target to relieve overstrain immediately.", rationale: "Overstrain scales with torque — lowering it buys inspection time.", effort: "Immediate", priority: "Critical", source: "deterministic" },
    { id: "osf-visual", title: "Visual spindle check", summary: "Look for scoring, heat marks or debris on the spindle taper.", rationale: "Confirms mechanical damage from prior overstrain events.", effort: "Next shift", priority: "Medium", source: "deterministic" },
    { id: "osf-monitor", title: "Watch overstrain trend", summary: "Log overstrain; escalate if it climbs across cycles.", rationale: "Catches slow drift before it becomes a critical event.", effort: "This week", priority: "Low", source: "deterministic" },
  ],
  RNF: [
    { id: "rnf-diagnostic", title: "Run diagnostic sweep", summary: "Full electrical + mechanical diagnostic to surface the stochastic fault.", rationale: "No dominant parameter driver — evidence points to an unpredictable fault signature.", effort: "Next shift", priority: "High", source: "deterministic" },
    { id: "rnf-inspect", title: "Inspect electrical & wiring", summary: "Check connectors, cables, and control wiring for intermittent faults.", rationale: "Random failures often come from loose or degraded electrical contacts.", effort: "This week", priority: "Medium", source: "deterministic" },
    { id: "rnf-log", title: "Gather logs & trend", summary: "Capture event logs and watch the anomaly percentile over time.", rationale: "Builds a baseline to detect the next intermittent signature.", effort: "This week", priority: "Low", source: "deterministic" },
    { id: "rnf-estimate", title: "Recalibrate estimate", summary: "Re-run assessment once the envelope is confirmed clean.", rationale: "Re-establishes a nominal baseline after a transient blip.", effort: "Next planned stop", priority: "Low", source: "deterministic" },
  ],
  NONE: [
    { id: "none-monitor", title: "Continue routine monitoring", summary: "Keep the machine on standard cadence; no intervention needed.", rationale: "All signals sit inside the nominal envelope with no degradation driver.", effort: "Next planned stop", priority: "Low", source: "deterministic" },
    { id: "none-review", title: "Review operating envelope", summary: "Spot-check the configured threshold against factory calibration.", rationale: "Confirms the alert band stays aligned with the real machine limits.", effort: "This week", priority: "Low", source: "deterministic" },
    { id: "none-update", title: "Refresh baseline", summary: "Recompute the reference envelope from recent healthy runs.", rationale: "Keeps the decision threshold anchored to the current asset.", effort: "This week", priority: "Low", source: "deterministic" },
    { id: "none-schedule", title: "Plan routine inspection", summary: "Add to the next planned maintenance stop.", rationale: "Preventive hygiene while no active failure mode is present.", effort: "Next planned stop", priority: "Low", source: "deterministic" },
  ],
};

export function recommendationCatalogFor(
  modeCode: FailureModeCode,
  probability: number,
): RecommendationOption[] {
  const seeds = RECOMMENDATION_CATALOG[modeCode] ?? RECOMMENDATION_CATALOG.NONE;
  const baseEffort = probability >= 0.8 ? "Immediate" : probability >= 0.6 ? "Immediate" : probability >= 0.35 ? "Next shift" : "This week";
  return seeds.map((s) => ({
    ...s,
    id: s.id,
    effort: (s.priority === "Critical" ? "Immediate" : s.effort) as RecommendationEffort,
    source: "deterministic",
  }));
}

export function buildRecommendationOptions(
  modeCode: FailureModeCode,
  failureProbability: number,
  kind: "llm" | "deterministic" = "deterministic",
): RecommendationOption[] {
  return recommendationCatalogFor(modeCode, failureProbability).map((o, i) => ({
    ...o,
    id: `${modeCode}-${o.id}`,
    source: kind,
  }));
}