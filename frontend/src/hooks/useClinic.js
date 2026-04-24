import { useEffect, useMemo, useState } from "react";
import { analyzePatient } from "../services/api";
import {
  createId,
  nowIso,
  buildDocumentMeta,
  normalizeTags,
  enrichRun,
  defaultPatients,
  simulateNote,
  recurringRisks
} from "../utils/clinic-utils";

const STORAGE_KEY = "clinix_patients_v1";

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
