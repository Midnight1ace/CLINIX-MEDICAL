const RISK_WEIGHTS = { low: 1, medium: 2, high: 3 };
const LEVEL_ORDER = ["low", "medium", "high", "critical"];

const SAMPLE_NOTES = [
  "45-year-old male with chest pain and shortness of breath. BP 150/95, HR 110, temp 37.8. Taking aspirin.",
  "62-year-old female reports dizziness and headache. BP 165/102, HR 98, temp 37.2. On lisinopril.",
  "30-year-old patient with fever and cough. Temp 38.6, HR 112, BP 118/76. Taking acetaminophen.",
  "70-year-old male with fatigue and palpitations. BP 142/88, HR 124, temp 36.9. Taking metformin."
];

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildDocumentMeta(file, source) {
  return {
    id: createId(),
    name: file.name,
    type: file.type || "unknown",
    size: file.size || 0,
    uploadedAt: nowIso(),
    source
  };
}

function normalizeTags(tags) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function riskScoreFrom(risks) {
  return (risks || []).reduce((total, risk) => total + (RISK_WEIGHTS[risk.level] || 1), 0);
}

function scoreToLevel(score) {
  if (score >= 7) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function bumpLevel(level) {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.min(idx + 1, LEVEL_ORDER.length - 1)];
}

function deriveStatus(level) {
  if (level === "critical") return "critical";
  if (level === "high") return "urgent";
  if (level === "medium") return "watch";
  return "stable";
}

function metricTrend(current, previous, threshold) {
  if (current == null || previous == null) return "flat";
  const delta = current - previous;
  if (delta > threshold) return "up";
  if (delta < -threshold) return "down";
  return "flat";
}

function buildTriggers(structured) {
  if (!structured) return [];
  const triggers = [];
  if (structured.age && structured.age >= 65) {
    triggers.push(`Age ${structured.age}`);
  }
  const vitals = structured.vitals || {};
  if (vitals.bp_systolic && vitals.bp_diastolic) {
    triggers.push(`BP ${vitals.bp_systolic}/${vitals.bp_diastolic}`);
  }
  if (vitals.heart_rate) {
    triggers.push(`HR ${vitals.heart_rate}`);
  }
  if (vitals.temperature_c) {
    triggers.push(`Temp ${vitals.temperature_c}C`);
  }
  if (structured.symptoms?.length) {
    structured.symptoms.forEach((symptom) => triggers.push(symptom));
  }
  return triggers;
}

function buildCorrelations(structured) {
  if (!structured) return [];
  const symptoms = new Set((structured.symptoms || []).map((s) => s.toLowerCase()));
  const vitals = structured.vitals || {};
  const correlations = [];

  if (symptoms.has("chest pain") && vitals.bp_systolic >= 140) {
    correlations.push("Chest pain + elevated BP suggests cardiac strain.");
  }
  if (symptoms.has("shortness of breath") && vitals.heart_rate >= 100) {
    correlations.push("Dyspnea + tachycardia indicates respiratory stress.");
  }
  if (symptoms.has("fever") && vitals.heart_rate >= 100) {
    correlations.push("Fever + high HR suggests infectious load.");
  }

  return correlations;
}

function buildAnomalies(current, previous) {
  if (!current || !previous) return [];
  const anomalies = [];
  const currVitals = current.vitals || {};
  const prevVitals = previous.vitals || {};

  if (
    currVitals.bp_systolic != null &&
    prevVitals.bp_systolic != null &&
    Math.abs(currVitals.bp_systolic - prevVitals.bp_systolic) >= 30
  ) {
    anomalies.push("Systolic BP changed by 30+ since last report.");
  }
  if (
    currVitals.heart_rate != null &&
    prevVitals.heart_rate != null &&
    Math.abs(currVitals.heart_rate - prevVitals.heart_rate) >= 20
  ) {
    anomalies.push("Heart rate changed by 20+ since last report.");
  }

  return anomalies;
}

function recurringRisks(history) {
  const recent = (history || []).slice(0, 3);
  const counts = {};
  recent.forEach((run) => {
    (run.risks || []).forEach((risk) => {
      counts[risk.title] = (counts[risk.title] || 0) + 1;
    });
  });

  return Object.keys(counts).filter((key) => counts[key] >= 2);
}

function enrichRun(analysis, rawText, previousRun) {
  const score = riskScoreFrom(analysis.risks || []);
  let level = scoreToLevel(score);

  const hasCriticalFlag = (analysis.risks || []).some((risk) =>
    risk.title.toLowerCase().includes("sever")
  );
  if (hasCriticalFlag || (analysis.risks || []).some((risk) => risk.level === "high" && risk.title.toLowerCase().includes("chest"))) {
    level = "critical";
  }

  const trend = {
    bp: metricTrend(analysis.structured?.vitals?.bp_systolic, previousRun?.structured?.vitals?.bp_systolic, 8),
    hr: metricTrend(analysis.structured?.vitals?.heart_rate, previousRun?.structured?.vitals?.heart_rate, 10),
    temp: metricTrend(analysis.structured?.vitals?.temperature_c, previousRun?.structured?.vitals?.temperature_c, 0.3)
  };

  const triggers = buildTriggers(analysis.structured);
  const correlations = buildCorrelations(analysis.structured);
  const anomalies = buildAnomalies(analysis.structured, previousRun?.structured);
  const ruleCount = (analysis.risks || []).filter((risk) => risk.source === "rule").length;
  const aiCount = (analysis.risks || []).filter((risk) => risk.source === "llm").length;
  const confidence = analysis.risks?.length
    ? (ruleCount * 0.9 + aiCount * 0.6) / analysis.risks.length
    : 0.75;

  const predictedRisk = trend.bp === "up" || trend.hr === "up" ? bumpLevel(level) : level;

  return {
    id: createId(),
    rawText,
    createdAt: nowIso(),
    steps: analysis.steps || [],
    structured: analysis.structured || null,
    summary: analysis.summary || "",
    risks: analysis.risks || [],
    recommendations: analysis.recommendations || [],
    explainability: analysis.explainability || [],
    riskScore: score,
    riskLevel: level,
    predictedRisk,
    trend,
    triggers,
    correlations,
    anomalies,
    confidence: Number(confidence.toFixed(2)),
    ruleCount,
    aiCount
  };
}

function defaultPatients() {
  return [
    {
      id: createId(),
      name: "Jordan Lee",
      age: 45,
      tags: ["cardio", "follow-up"],
      priority: "high",
      status: "watch",
      notes: "BP trending up over last 2 visits.",
      documents: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      history: []
    },
    {
      id: createId(),
      name: "Amira Khan",
      age: 62,
      tags: ["hypertension"],
      priority: "medium",
      status: "stable",
      notes: "Monitor adherence to lisinopril.",
      documents: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      history: []
    }
  ];
}

function simulateNote() {
  return SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)];
}

export {
  createId,
  nowIso,
  buildDocumentMeta,
  normalizeTags,
  riskScoreFrom,
  scoreToLevel,
  bumpLevel,
  deriveStatus,
  metricTrend,
  buildTriggers,
  buildCorrelations,
  buildAnomalies,
  recurringRisks,
  enrichRun,
  defaultPatients,
  simulateNote
};
