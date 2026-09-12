import { derive, round, clampP } from "@/lib/derived";
import { FAILURE_MODES, healthFromProbability, riskFromProbability, severityFromProbability, priorityFromProbability } from "@/lib/domain";
const PRODUCT_FACTOR = { L: 0, M: 0.06, H: 0.14 };
function sig(center, n, steep = 1) {
    return clampP(1 / (1 + Math.exp(-steep * (n - center))));
}
export function simulateAssessment(input) {
    const d = derive(input);
    const product = PRODUCT_FACTOR[input.productType];
    const twf = sig(200, input.toolWear, 0.055) * (1 + product * 0.6);
    const hdf = clampP((22 - d.tempDifference) / 24) * (1 + Math.abs(input.processTemp - 310) * 0.004);
    const pwf = sig(5000, d.mechanicalPower * 1.25, 0.0012) * (1 + product * 0.5);
    const osf = sig(7600, d.overstrain, 0.00045);
    const rnf = 0.025;
    const union = Math.min(1, 1 - (1 - twf) * (1 - hdf) * (1 - pwf) * (1 - osf) * (1 - rnf));
    const failureProbability = round(clampP(union + 0.03 * product), 4);
    const scores = {
        TWF: twf,
        HDF: hdf,
        PWF: pwf,
        OSF: osf,
        RNF: rnf * 1.2,
        NONE: clampP(1 - failureProbability) * 0.5,
    };
    const top = Object.keys(scores).filter((k) => k !== "NONE").sort((a, b) => scores[b] - scores[a])[0];
    const mode = failureProbability < 0.3 && scores[top] < 0.32 ? "NONE" : top;
    const modes = Object.keys(scores)
        .filter((k) => k !== "NONE")
        .sort((a, b) => scores[b] - scores[a])
        .slice(0, 4)
        .map((code) => ({ code, name: FAILURE_MODES[code].name, probability: round(scores[code], 3) }));
    const healthStatus = healthFromProbability(failureProbability);
    const riskLevel = riskFromProbability(failureProbability);
    const priority = priorityFromProbability(failureProbability);
    const severity = severityFromProbability(failureProbability);
    const drivers = [];
    if (twf > 0.3)
        drivers.push({ key: "tool_wear", label: "Tool wear", value: input.toolWear, magnitude: round(twf, 2), direction: "increases" });
    if (hdf > 0.3)
        drivers.push({ key: "temp_difference", label: "Temperature difference", value: round(d.tempDifference, 1), magnitude: round(hdf, 2), direction: "decreases" });
    if (pwf > 0.3)
        drivers.push({ key: "mechanical_power", label: "Mechanical power", value: round(d.mechanicalPower, 0), magnitude: round(pwf, 2), direction: "increases" });
    if (osf > 0.3)
        drivers.push({ key: "overstrain", label: "Overstrain", value: round(d.overstrain, 0), magnitude: round(osf, 2), direction: "increases" });
    const contributing = drivers.length ? drivers.slice(0, 4) : [{ key: "tool_wear", label: "Tool wear", value: input.toolWear, magnitude: 0.02, direction: "increases" }];
    const evidence = [];
    if (mode !== "NONE") {
        evidence.push(`${FAILURE_MODES[mode].indicator}`);
    }
    if (drivers.length) {
        const topDriver = drivers[drivers.length - 1];
        evidence.push(topDriver.direction === "decreases"
            ? `${topDriver.label} at ${topDriver.value} is below the safe band for this operating envelope.`
            : `${topDriver.label} at ${topDriver.value} sits high against historical operating ranges.`);
    }
    if (healthStatus !== "Normal" && healthStatus !== "Warning")
        evidence.push("Urgency ranked by failure probability against the decision threshold.");
    const topFeature = contributing[0];
    const explanation = mode === "NONE"
        ? "All monitored parameters and derived measures sit inside the nominal envelope. Failure probability is below the alert threshold; no dominant degradation driver is present."
        : `${topFeature.label} is the dominant shift behind the ${FAILURE_MODES[mode].name.toLowerCase()} profile, with a combined failure probability of ${(failureProbability * 100).toFixed(1)}%. ${drivers.length > 1 ? `${drivers.length - 1} additional driver${drivers.length > 2 ? "s" : ""} reinforce the estimate.` : ""} Risk is classified ${riskLevel}.`;
    const recommendation = mode === "NONE"
        ? FAILURE_MODES.NONE.action
        : `${FAILURE_MODES[mode].action} — ${healthStatus === "Critical" ? "perform a full inspection before the next production cycle" : healthStatus === "High Risk" ? "schedule within the next operating window" : priority === "Warning" ? "add to the next inspection batch" : "monitor on the routine cadence"}.`;
    const anomalyPercentile = round(clampP(Math.min(0.99, failureProbability + 0.22)), 3) * 100;
    return {
        failureProbability,
        healthStatus,
        riskLevel,
        mode,
        modes,
        contributing,
        evidence,
        explanation,
        recommendation,
        threshold: 0.5,
        anomalyPercentile,
        modelVersion: "fathom-physics-sim v1",
        latencyMs: 6 + Math.floor(input.toolWear % 12),
        notice: severity === "Critical"
            ? "Simulated physics fallback — the live model is unreachable. Treat output as a demonstration reference, not a verified calibration."
            : "Simulated physics fallback — the live model is unreachable. Output reflects deterministic heuristics, not factory calibration.",
    };
}
