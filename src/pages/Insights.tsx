import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BrainCircuit, Check } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { EmptyState } from "@/components/deck/EmptyState";
import { StatCard } from "@/components/instrument/StatCard";
import { RiskGauge } from "@/components/instrument/RiskGauge";
import { FeatureBars } from "@/components/instrument/FeatureBars";
import { useAppStore } from "@/lib/store";
import { derive, fmtInt, fmtNum, fmtPercent, fmtTs } from "@/lib/derived";
import type { Assessment, HealthStatus } from "@/lib/types";

const HEALTH_PRIORITY: Record<HealthStatus, number> = {
  Critical: 0,
  "High Risk": 1,
  Warning: 2,
  Normal: 3,
};

const LABELS: Record<string, string> = {
  airTemp: "Air temperature",
  processTemp: "Process temperature",
  speed: "Rotational speed",
  torque: "Torque",
  toolWear: "Tool wear",
};

export function Insights() {
  const assessments = useAppStore((s) => s.assessments);
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("assessment");

  const spotlight = useMemo(() => {
    return [...assessments].sort((x, y) => {
      const byHealth = HEALTH_PRIORITY[x.healthStatus] - HEALTH_PRIORITY[y.healthStatus];
      if (byHealth !== 0) return byHealth;
      return new Date(y.ts).getTime() - new Date(x.ts).getTime();
    });
  }, [assessments]);

  const [selectedId, setSelectedId] = useState<string>(() => assessmentId ?? spotlight[0]?.id ?? "");

  const selected = useMemo<Assessment | undefined>(() => {
    // Prefer URL param
    if (assessmentId) {
      const found = assessments.find((x) => x.id === assessmentId);
      if (found) return found;
    }
    const found = assessments.find((x) => x.id === selectedId);
    return found ?? spotlight[0];
  }, [assessments, selectedId, assessmentId, spotlight]);

  const selectable = assessments.slice(0, 12);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="05 / AI Insights"
        title="AI insights"
        description="Plain-language breakdown of an assessment — why the model is worried, which signals drive it, and what to do next."
        right={
          selectable.length ? (
            <select
              value={selected?.id ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Select assessment"
              className="h-9 max-w-72 cursor-pointer rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-[11px] tabular-nums text-ink outline-none transition-colors focus:border-signal/60"
            >
              {selectable.map((x) => (
                <option key={x.id} value={x.id} className="bg-surface text-ink">
                  {x.inputs.machineId} · {fmtPercent(x.failureProbability)} · {fmtTs(x.ts)}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      {!assessments.length ? (
        <EmptyState
          icon={BrainCircuit}
          eyebrow="No insight source"
          title="No assessment to explain yet"
          description="Run a machine assessment and it becomes the explainability source — the model maps raw signals into feature attribution, evidence, derived checks, and a plain-language why report."
          action={
            <Link to="/analyze">
              <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />} label="Run an assessment" />
            </Link>
          }
        />
      ) : (
        selected && <InsightsReport a={selected} />
      )}
    </div>
  );
}

function InsightsReport({ a }: { a: Assessment }) {
  const d = derive(a.inputs);
  const recommendationSelections = useAppStore((s) => s.recommendationSelections);
  const selectRecommendation = useAppStore((s) => s.selectRecommendation);
  const options = a.recommendationOptions;
  const selectedOptionId =
    recommendationSelections[a.inputs.machineId]?.optionId ?? a.selectedRecommendationId;

  const parameterRows = a.contributing.length
    ? a.contributing.map((f) => ({
        key: f.key,
        label: f.label,
        value: `${fmtNum(f.value, 1)}${f.unit ?? ""}`,
        chip:
          f.direction === "increases" ? (
            <Badge tone="high">+ risk</Badge>
          ) : (
            <Badge tone="healthy">− risk</Badge>
          ),
      }))
    : [
        { key: "productType", label: "Product type", value: a.inputs.productType, chip: <Badge tone="neutral">neutral</Badge> },
        { key: "airTemp", label: LABELS.airTemp, value: `${fmtNum(a.inputs.airTemp, 1)} K`, chip: <Badge tone="neutral">neutral</Badge> },
        { key: "processTemp", label: LABELS.processTemp, value: `${fmtNum(a.inputs.processTemp, 1)} K`, chip: <Badge tone="neutral">neutral</Badge> },
        { key: "speed", label: LABELS.speed, value: `${fmtInt(a.inputs.speed)} rpm`, chip: <Badge tone="neutral">neutral</Badge> },
        { key: "torque", label: LABELS.torque, value: `${fmtNum(a.inputs.torque, 1)} Nm`, chip: <Badge tone="neutral">neutral</Badge> },
        { key: "toolWear", label: LABELS.toolWear, value: `${fmtNum(a.inputs.toolWear, 1)} min`, chip: <Badge tone="neutral">neutral</Badge> },
      ];

  return (
    <>
      <Panel
        title="Assessment spotlight"
        eyebrow="Selected run"
        right={
          <div className="flex items-center gap-2.5">
            <Badge tone={a.source === "live" || a.source === "fastapi" ? "signal" : "elevated"}>
              {a.source === "live" || a.source === "fastapi" ? "Live model" : a.source === "gradio" ? "Gradio fallback" : "Simulated"}
            </Badge>
            <span className="font-mono text-[10px] text-ink-3">{a.modelVersion && <>v{a.modelVersion}</>}</span>
            <span className="hidden font-mono text-[10px] tabular-nums text-ink-3 sm:inline">
              {fmtTs(a.ts, { full: true, seconds: true })}
            </span>
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-lg font-semibold tracking-tight text-ink">{a.inputs.machineId}</p>
          <div className="flex justify-center">
            <RiskGauge probability={a.failureProbability} size={150} />
          </div>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <StatCard label="Health" value={a.healthStatus} tone={toneForStatus(a.healthStatus)} />
            <StatCard label="Risk" value={a.riskLevel} tone={toneForStatus(a.riskLevel)} />
            <StatCard label="Probability" value={fmtPercent(a.failureProbability)} tone="signal" />
          </div>
        </div>
      </Panel>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Feature importance" eyebrow="SHAP-style attribution">
          {a.contributing.length ? (
            <FeatureBars features={a.contributing} />
          ) : (
            <p className="text-[13px] text-ink-2">No per-feature attribution returned for this run.</p>
          )}
        </Panel>

        <Panel title="Important parameters" eyebrow="Observed values">
          <div>
            {parameterRows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-b-0">
                <span className="text-[12.5px] text-ink-2">{r.label}</span>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11.5px] tabular-nums text-ink">{r.value}</span>
                  {r.chip}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Condition evidence" eyebrow="Why it was flagged">
        {a.evidence.length ? (
          <ul className="space-y-1.5">
            {a.evidence.map((e, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-signal/70" />
                {e}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-ink-2">No condition evidence returned for this run.</p>
        )}
      </Panel>

      <Panel title="Derived calculations" eyebrow="Checks performed">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-hairline bg-surface/50 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">ΔT</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ink">
                {fmtNum(d.tempDifference, 1)} <span className="text-[10px] font-normal text-ink-3">K</span>
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-ink-3">process − air</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface/50 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Mechanical power</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ink">
                {fmtInt(d.mechanicalPower)} <span className="text-[10px] font-normal text-ink-3">W</span>
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-ink-3">torque · rpm · 2π / 60</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface/50 px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">Overstrain</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ink">
                {fmtInt(d.overstrain)} <span className="text-[10px] font-normal text-ink-3">W·min</span>
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-ink-3">toolWear · torque</p>
            </div>
          </div>
          <div className="rounded-lg border border-hairline bg-surface/40 px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Raw inputs</p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums">
              <span className="text-ink-3">Product <span className="text-ink">{a.inputs.productType}</span></span>
              <span className="text-ink-3">Air <span className="text-ink">{fmtNum(a.inputs.airTemp, 1)} K</span></span>
              <span className="text-ink-3">Process <span className="text-ink">{fmtNum(a.inputs.processTemp, 1)} K</span></span>
              <span className="text-ink-3">Speed <span className="text-ink">{fmtInt(a.inputs.speed)} rpm</span></span>
              <span className="text-ink-3">Torque <span className="text-ink">{fmtNum(a.inputs.torque, 1)} Nm</span></span>
              <span className="text-ink-3">Tool wear <span className="text-ink">{fmtNum(a.inputs.toolWear, 1)} min</span></span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Plain-language explanation" eyebrow="What the model says">
        <p className="text-[13.5px] leading-relaxed text-ink-2">{a.explanation}</p>
      </Panel>

      {options?.length ? (
        <Panel title="Recommendation options" eyebrow="Choose a response">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.slice(0, 4).map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectRecommendation(a.inputs.machineId, a.id, opt.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full flex-col items-start gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-signal/60 bg-signal/10 ring-1 ring-signal/40"
                      : "border-hairline bg-surface/40 hover:border-signal/30 hover:bg-surface/70"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2.5">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium leading-snug text-ink">
                      {opt.title}
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-signal" strokeWidth={2.5} />}
                    </span>
                    <Badge tone={effortTone(opt.effort)}>{opt.effort}</Badge>
                  </div>
                  <span className="text-[12px] leading-relaxed text-ink-2">{opt.summary}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      ) : (
        <Panel title="Recommended action" eyebrow="Next step">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{a.recommendation}</p>
        </Panel>
      )}
    </>
  );
}

function toneForStatus(status: string): "healthy" | "elevated" | "high" | "critical" | "signal" | "neutral" {
  if (status === "Critical") return "critical";
  if (status === "High Risk" || status === "High") return "high";
  if (status === "Warning" || status === "Medium") return "elevated";
  if (status === "Normal" || status === "Low") return "healthy";
  return "neutral";
}

function effortTone(effort: string): "healthy" | "elevated" | "high" | "critical" | "signal" | "neutral" {
  const s = effort.toLowerCase();
  if (s.includes("immediate")) return "high";
  if (s.includes("shift") || s.includes("week")) return "elevated";
  if (s.includes("planned")) return "healthy";
  return "neutral";
}
