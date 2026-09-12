import { Eraser, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Button } from "@/components/deck/Button";
import { StatusDot } from "@/components/deck/StatusDot";
import { StatCard } from "@/components/instrument/StatCard";
import { useAppStore } from "@/lib/store";
import { probeConnection } from "@/lib/api/provider";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE = {
  checking: "neutral",
  live: "healthy",
  simulated: "elevated",
  offline: "critical",
} as const;

const STATUS_LABEL = {
  checking: "Checking",
  live: "Live model",
  simulated: "Simulated engine",
  offline: "Offline",
} as const;

export function SettingsPage() {
  const connection = useAppStore((s) => s.connection);
  const apiBase = useAppStore((s) => s.apiBase);
  const setApiBase = useAppStore((s) => s.setApiBase);
  const useSimulated = useAppStore((s) => s.useSimulated);
  const setUseSimulated = useAppStore((s) => s.setUseSimulated);
  const probe = useAppStore((s) => s.probe);
  const assessments = useAppStore((s) => s.assessments);
  const alerts = useAppStore((s) => s.alerts);
  const notifications = useAppStore((s) => s.notifications);
  const clearAssessments = useAppStore((s) => s.clearAssessments);
  const clearAlerts = useAppStore((s) => s.clearAlerts);
  const clearData = useAppStore((s) => s.clearData);

  const latestModelVersion = assessments[0]?.modelVersion;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="07 / Settings"
        title="Settings & profile"
        description="Model connection, data controls, and operator profile for this workbench."
        right={
          <div className="flex items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 py-1.5 pl-1.5 pr-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-dim font-mono text-[10px] font-semibold text-signal">
              OP
            </span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2">
              Operator · Fathom
            </span>
          </div>
        }
      />

      <Panel title="Model connection" eyebrow="Backend">
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="api-base" className="text-[11px] font-medium text-ink-2">
                API base URL
              </label>
            </div>
            <input
              id="api-base"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="https://…-hf.space"
              className="h-9 w-full rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-[12px] tabular-nums text-ink outline-none transition-colors focus:border-signal/60"
            />
            <p className="mt-1.5 font-mono text-[10px] text-ink-3">
              Expects a Gradio 4+ app exposing /gradio_api.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-hairline pt-4">
            <button
              role="switch"
              aria-checked={useSimulated}
              aria-label="Force simulated engine"
              onClick={() => setUseSimulated(!useSimulated)}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                useSimulated ? "border-signal/50 bg-signal-dim" : "border-hairline-strong bg-raised",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform",
                  useSimulated ? "translate-x-[18px] bg-signal" : "translate-x-[3px] bg-ink-3",
                )}
              />
            </button>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">Force simulated engine</p>
              <p className="text-[11.5px] text-ink-3">
                {useSimulated
                  ? "Simulation forced — results will be labeled Simulated."
                  : "Prefer the live model; simulate only when the backend is unreachable."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              label="Re-check connection"
              onClick={() => void probe(probeConnection)}
            />
            <div className="flex min-w-0 items-center gap-2.5 pl-1">
              <StatusDot
                tone={STATUS_TONE[connection.status]}
                pulse={connection.status === "checking"}
                size="sm"
              />
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-2">
                  {STATUS_LABEL[connection.status]}
                </p>
                {connection.message && (
                  <p className="truncate text-[12px] text-ink-3">{connection.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Data" eyebrow="Local persistence">
        <div className="space-y-4">
          <section className="grid grid-cols-3 gap-3" aria-label="Stored data counts">
            <StatCard label="Assessments" value={String(assessments.length)} />
            <StatCard label="Alerts" value={String(alerts.length)} />
            <StatCard label="Notifications" value={String(notifications.length)} />
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={<Eraser className="h-3.5 w-3.5" />}
              label="Clear assessments"
              onClick={() => clearAssessments()}
            />
            <Button
              variant="danger"
              size="sm"
              icon={<Eraser className="h-3.5 w-3.5" />}
              label="Clear alerts"
              onClick={() => clearAlerts()}
            />
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Clear all data"
              onClick={() => clearData()}
            />
          </div>

          <p className="border-t border-hairline pt-3 text-[11.5px] text-ink-3">
            Data is persisted to this browser (localStorage). Deleting is permanent.
          </p>
        </div>
      </Panel>

      <Panel title="Honesty & calibration" eyebrow="Decision-support scope">
        <ul className="space-y-2">
          {[
            "Model runs live on the shared HF Space when reachable.",
            "Otherwise a deterministic simulated physics engine is used and every result carries a SIMULATED badge.",
            "Probabilities are decision-support, not certified.",
            "Validate against factory calibration before acting.",
            "No machine telemetry is invented — every machine, alert and trend comes from assessments run in this session/browser.",
          ].map((text) => (
            <li key={text} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-signal/70" />
              {text}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="About" eyebrow="Workbench">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              Fathom <span className="font-normal text-ink-2">· Predictive Maintenance Agent</span>
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
              Version {APP_VERSION}
            </p>
          </div>
          {latestModelVersion && (
            <p className="text-right font-mono text-[10px] text-ink-3">
              Latest model
              <span className="ml-1.5 text-signal">v{latestModelVersion}</span>
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

const APP_VERSION = "0.1.0";