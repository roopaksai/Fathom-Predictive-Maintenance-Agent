import { derive, round, uid } from "@/lib/derived";
import { healthFromProbability, riskFromProbability, priorityFromProbability, FAILURE_MODES } from "@/lib/domain";
import { simulateAssessment } from "@/lib/api/fallback";
import { api } from "@/lib/api/client";
export async function probeConnection() {
    try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(`${api["baseUrl"]}/api/v1/health`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok)
            return { status: "offline", message: `Backend responded ${res.status}` };
        return { status: "live", message: `Connected to ${api["baseUrl"]}` };
    }
    catch (e) {
        return {
            status: "offline",
            message: e instanceof Error && e.name === "AbortError" ? "Backend unreachable (timeout)" : "Backend unreachable",
        };
    }
}
export async function runAssessment(input) {
    const baseUrl = api["baseUrl"];
    // Try FastAPI first
    try {
        const assessment = await api.predict(input);
        return {
            assessment: normalizeAssessment(assessment),
            connection: { status: "live", message: `Connected to ${baseUrl} (FastAPI)` },
        };
    }
    catch (fastApiError) {
        console.warn("FastAPI prediction failed, trying Gradio:", fastApiError);
    }
    // Try Gradio as fallback
    try {
        const eventId = await postAssess(baseUrl, input);
        const outputs = await streamAssess(baseUrl, eventId);
        const data = parseGradioOutputs(input, outputs);
        return {
            assessment: buildAssessment(input, data, "live"),
            connection: { status: "live", message: `Connected to ${baseUrl} (Gradio fallback)` },
        };
    }
    catch (gradioError) {
        console.warn("Gradio prediction failed, using simulated:", gradioError);
    }
    // Final fallback: simulated
    const sim = simulateAssessment(input);
    return {
        assessment: buildAssessment(input, simDataToGradio(sim), "simulated"),
        connection: { status: "simulated", message: "Using simulated engine — backend unavailable" },
    };
}
function simDataToGradio(sim) {
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
function normalizeHealth(s, p) {
    if (!s)
        return healthFromProbability(p);
    const norm = s.trim().toLowerCase();
    if (norm.includes("critic"))
        return "Critical";
    if (norm.includes("high") || norm.includes("elevated"))
        return "High Risk";
    if (norm.includes("warn") || norm.includes("moderate") || norm.includes("medium"))
        return "Warning";
    if (norm.includes("normal") || norm.includes("healthy") || norm.includes("ok"))
        return "Normal";
    return healthFromProbability(p);
}
function normalizeAssessment(assessment) {
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
function buildAssessment(input, data, source) {
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
    const modeCode = (primary?.code ?? "NONE");
    const modeName = primary?.name ?? FAILURE_MODES.NONE.name;
    const mode = { code: modeCode, name: modeName, probability: primary?.probability, confidence: primary?.confidence, note: primary?.note };
    const evidence = data.evidence.length
        ? data.evidence
        : modeCode === "NONE"
            ? ["No condition evidence triggered — all monitored signals within bounds."]
            : [FAILURE_MODES[modeCode].indicator];
    const explanation = data.explanation || (modeCode === "NONE" ? "No dominant degradation driver detected." : `Primary driver: ${evidence[0]}`);
    const recommendation = data.recommendation || (modeCode === "NONE" ? FAILURE_MODES.NONE.action : FAILURE_MODES[modeCode].action);
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
        priority: priority,
        modelVersion: data.modelVersion,
        latencyMs: data.latencyMs,
        notice: data.notice,
    };
}
// Gradio fallback functions
const GRADIO_API_URL = "https://vvsgyuv123-predictive-maintenance-demo.hf.space/gradio_api";
async function postAssess(base, input) {
    const res = await fetch(`${GRADIO_API_URL}/call/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: [
                input.productType,
                input.airTemp,
                input.processTemp,
                input.speed,
                input.torque,
                input.toolWear,
                input.machineId || "UNKNOWN",
                input.state || "RUNNING",
            ],
        }),
    });
    if (!res.ok)
        throw new Error(`Gradio call failed: ${res.status}`);
    const json = await res.json();
    const eventId = json.event_id;
    if (!eventId)
        throw new Error("No event_id from Gradio");
    return eventId;
}
async function streamAssess(base, eventId) {
    const res = await fetch(`${GRADIO_API_URL}/call/assess/${eventId}`, {
        headers: { Accept: "text/event-stream" },
    });
    if (!res.ok)
        throw new Error(`Gradio stream failed: ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader)
        throw new Error("No response body");
    const decoder = new TextDecoder();
    const outputs = [];
    let buffer = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    const parsed = JSON.parse(line.slice(6));
                    if (parsed.msg === "process_completed") {
                        outputs.push(...parsed.output?.data ?? []);
                    }
                }
                catch {
                    // Ignore parse errors
                }
            }
        }
    }
    return outputs;
}
function parseGradioOutputs(input, outputs) {
    if (!outputs.length)
        throw new Error("No outputs from Gradio");
    const data = outputs[0];
    return {
        failureProbability: data.failure_probability,
        healthStatus: data.health_status,
        riskLevel: data.risk_level,
        modes: data.failure_modes?.map((m) => ({
            code: m.mode_code,
            name: m.mode_name,
            probability: m.probability,
            confidence: m.confidence,
            note: m.note,
        })) ?? [],
        contributing: data.contributing_features ?? [],
        evidence: data.condition_evidence ?? [],
        explanation: data.explanation,
        recommendation: data.recommended_maintenance_action,
        decisionThreshold: data.decision_threshold,
        anomalyPercentile: data.anomaly_percentile,
        modelVersion: data.model_version,
        latencyMs: data.latency_ms,
        notice: data.decision_support_notice,
    };
}
