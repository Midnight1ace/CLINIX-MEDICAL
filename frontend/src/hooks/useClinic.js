import { useEffect, useMemo, useState } from "react";
import { analyzePatient } from "../services/api";

const STORAGE_KEY = "clinix_patients_v1";

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

export function useClinic() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertThreshold, setAlertThreshold] = useState(2);
  const [autoPriority, setAutoPriority] = useState(true);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw).map((patient) => ({
          documents: [],
          ...patient,
          documents: patient.documents || []
        }));
        setPatients(parsed);
        setSelectedId(parsed[0]?.id || null);
        return;
      }
    } catch (err) {
      console.warn("Failed to load patients", err);
    }

    const seed = defaultPatients();
    setPatients(seed);
    setSelectedId(seed[0]?.id || null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    if (!liveMode || !selectedId) return;
    const interval = setInterval(() => {
      simulateUpdate(selectedId);
    }, 20000);
    return () => clearInterval(interval);
  }, [liveMode, selectedId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedId) || null,
    [patients, selectedId]
  );

  const latestRun = useMemo(() => selectedPatient?.history?.[0] || null, [selectedPatient]);

  const clusters = useMemo(() => {
    return patients.reduce(
      (acc, patient) => {
        const level = patient.history?.[0]?.riskLevel || "low";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    );
  }, [patients]);

  const alerts = useMemo(() => {
    return patients
      .map((patient) => ({
        patient,
        run: patient.history?.[0]
      }))
      .filter((item) => item.run)
      .filter((item) => item.run.riskScore >= alertThreshold)
      .sort((a, b) => b.run.riskScore - a.run.riskScore);
  }, [patients, alertThreshold]);

  const similarCases = useMemo(() => {
    if (!selectedPatient || !latestRun?.structured?.symptoms?.length) return [];
    const target = new Set(latestRun.structured.symptoms.map((s) => s.toLowerCase()));

    return patients
      .filter((patient) => patient.id !== selectedPatient.id)
      .map((patient) => {
        const run = patient.history?.[0];
        const symptoms = new Set((run?.structured?.symptoms || []).map((s) => s.toLowerCase()));
        const intersection = [...target].filter((sym) => symptoms.has(sym));
        const union = new Set([...target, ...symptoms]);
        const score = union.size ? intersection.length / union.size : 0;
        return { patient, score };
      })
      .filter((item) => item.score >= 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [patients, selectedPatient, latestRun]);

  const addPatient = (payload) => {
    const newPatient = {
      id: createId(),
      name: payload.name || "Unnamed Patient",
      age: payload.age ? Number(payload.age) : null,
      tags: normalizeTags(payload.tags || ""),
      priority: payload.priority || "medium",
      status: "stable",
      notes: payload.notes || "",
      documents: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      history: []
    };

    setPatients((prev) => [newPatient, ...prev]);
    setSelectedId(newPatient.id);
  };

  const updatePatient = (id, updates) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== id) return patient;
        return {
          ...patient,
          ...updates,
          tags: updates.tags ? normalizeTags(updates.tags) : patient.tags,
          updatedAt: nowIso()
        };
      })
    );
  };

  const removePatient = (id) => {
    setPatients((prev) => {
      const next = prev.filter((patient) => patient.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id || null);
      }
      return next;
    });
  };

  const analyzeForPatient = async (id, rawText) => {
    if (!id || !rawText?.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzePatient(rawText);
      setPatients((prev) =>
        prev.map((patient) => {
          if (patient.id !== id) return patient;
          const previousRun = patient.history?.[0] || null;
          const run = enrichRun(analysis, rawText, previousRun);
          const history = [run, ...(patient.history || [])];
          const autoPriorityValue = autoPriority ? run.riskLevel : patient.priority;

          return {
            ...patient,
            priority: autoPriorityValue,
            status: deriveStatus(run.riskLevel),
            updatedAt: nowIso(),
            history
          };
        })
      );
    } catch (err) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runScenarioSet = async (id, count = 3) => {
    if (!id) return;
    for (let i = 0; i < count; i += 1) {
      const note = simulateNote();
      // eslint-disable-next-line no-await-in-loop
      await analyzeForPatient(id, note);
    }
  };

  const simulateUpdate = async (id) => {
    if (!id) return;
    const note = simulateNote();
    await analyzeForPatient(id, note);
  };

  const addDocuments = (id, files, source = "doctor") => {
    if (!id || !files?.length) return;
    const entries = Array.from(files).map((file) => buildDocumentMeta(file, source));
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== id) return patient;
        const existing = patient.documents || [];
        return {
          ...patient,
          documents: [...entries, ...existing],
          updatedAt: nowIso()
        };
      })
    );
  };

  const recurring = useMemo(() => {
    return recurringRisks(selectedPatient?.history || []);
  }, [selectedPatient]);

  const reportPayload = useMemo(() => {
    if (!selectedPatient || !latestRun) return null;
    return {
      patient: {
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age,
        tags: selectedPatient.tags,
        priority: selectedPatient.priority,
        status: selectedPatient.status
      },
      latestRun,
      generatedAt: nowIso()
    };
  }, [selectedPatient, latestRun]);

  return {
    patients,
    selectedId,
    setSelectedId,
    selectedPatient,
    latestRun,
    clusters,
    alerts,
    similarCases,
    recurring,
    reportPayload,
    loading,
    error,
    alertThreshold,
    setAlertThreshold,
    autoPriority,
    setAutoPriority,
    liveMode,
    setLiveMode,
    addPatient,
    updatePatient,
    removePatient,
    addDocuments,
    analyzeForPatient,
    runScenarioSet,
    simulateUpdate
  };
}
