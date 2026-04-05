"use client";

import { useMemo, useState } from "react";
import AlertsPanel from "../components/AlertsPanel";
import ComparisonPanel from "../components/ComparisonPanel";
import InsightsPanel from "../components/InsightsPanel";
import PatientDetail from "../components/PatientDetail";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import PipelineView from "../components/PipelineView";
import ReportPanel from "../components/ReportPanel";
import StatCard from "../components/StatCard";
import Timeline from "../components/Timeline";
import { useClinic } from "../hooks/useClinic";

function RiskCluster({ clusters }) {
  const total = Object.values(clusters).reduce((sum, value) => sum + value, 0) || 1;
  const levels = [
    { key: "critical", label: "Critical", color: "bg-red-500" },
    { key: "high", label: "High", color: "bg-orange-400" },
    { key: "medium", label: "Medium", color: "bg-amber-400" },
    { key: "low", label: "Low", color: "bg-emerald-400" }
  ];

  return (
    <div className="glass-card p-5 space-y-3">
      <h2 className="text-lg font-semibold">Risk Clustering</h2>
      {levels.map((level) => {
        const value = clusters[level.key] || 0;
        const width = Math.max(8, Math.round((value / total) * 100));
        return (
          <div key={level.key}>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>{level.label}</span>
              <span>{value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/10">
              <div className={`h-2 rounded-full ${level.color}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const {
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
    analyzeForPatient,
    runScenarioSet,
    simulateUpdate
  } = useClinic();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter((patient) => patient.history?.[0]?.riskLevel === "critical").length;
    const scores = patients.map((patient) => patient.history?.[0]?.riskScore || 0);
    const avg = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
    return { total, critical, avg };
  }, [patients]);

  const handleSavePatient = (form) => {
    if (editing) {
      updatePatient(editing.id, form);
    } else {
      addPatient(form);
    }
    setEditing(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen p-6 md:p-10 space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 font-bold">
              C
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">CLINIX Command Center</h1>
              <p className="text-sm text-slate-300">
                Multi-agent clinical workflow with explainable, hybrid intelligence.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className={`btn-ghost ${autoPriority ? "border-emerald-400/40" : ""}`}
              type="button"
              onClick={() => setAutoPriority(!autoPriority)}
            >
              Auto-prioritize {autoPriority ? "On" : "Off"}
            </button>
            <span className="chip">Offline-ready (local)</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Patients" value={stats.total} helper="Active roster" />
          <StatCard label="Critical Patients" value={stats.critical} helper="Immediate attention" />
          <StatCard label="Avg Risk Score" value={stats.avg} helper="Across latest reports" />
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_2fr]">
        <div className="space-y-6">
          {showForm && (
            <PatientForm
              initial={editing}
              onSave={handleSavePatient}
              onCancel={() => {
                setEditing(null);
                setShowForm(false);
              }}
            />
          )}
          <PatientList
            patients={patients}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => {
              setEditing(null);
              setShowForm(true);
            }}
            onRemove={removePatient}
          />
          <RiskCluster clusters={clusters} />
          <AlertsPanel
            alerts={alerts}
            threshold={alertThreshold}
            onThresholdChange={setAlertThreshold}
            liveMode={liveMode}
            onLiveToggle={() => setLiveMode(!liveMode)}
          />
        </div>

        <div className="space-y-6">
          <PatientDetail
            patient={selectedPatient}
            latestRun={latestRun}
            history={selectedPatient?.history || []}
            loading={loading}
            onAnalyze={(rawText) => analyzeForPatient(selectedId, rawText)}
            onRunScenario={() => runScenarioSet(selectedId, 3)}
            onSimulate={() => simulateUpdate(selectedId)}
            onUpdateNotes={(notes) => updatePatient(selectedId, { notes })}
            onEdit={() => {
              setEditing(selectedPatient);
              setShowForm(true);
            }}
          />
          <Timeline history={selectedPatient?.history || []} />
          <PipelineView run={latestRun} />
          <InsightsPanel run={latestRun} recurring={recurring} similarCases={similarCases} />
          <ReportPanel report={reportPayload} />
          <ComparisonPanel patients={patients} />
        </div>
      </section>
    </main>
  );
}
