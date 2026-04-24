import { useEffect, useMemo, useState } from "react";
import ExplainabilityModal from "../modals/ExplainabilityModal";
import InputPanel from "../panels/InputPanel";
import Recommendations from "./Recommendations";
import RiskAlerts from "./RiskAlerts";
import SummaryCard from "./SummaryCard";

const LEVEL_ORDER = ["low", "medium", "high", "critical"];

function levelDown(level) {
  const index = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.max(index - 1, 0)];
}

export default function PatientDetail({
  patient,
  latestRun,
  history,
  loading,
  onAnalyze,
  onRunScenario,
  onSimulate,
  onUpdateNotes,
  onEdit
}) {
  const [rawText, setRawText] = useState("");
  const [notes, setNotes] = useState("");
  const [showExplain, setShowExplain] = useState(false);

  useEffect(() => {
    setRawText(latestRun?.rawText || "");
    setNotes(patient?.notes || "");
  }, [patient?.id, latestRun]);

  const trendSummary = useMemo(() => {
    if (!history || history.length < 2) return "stable";
    const current = history[0];
    const previous = history[1];
    if (current.riskScore > previous.riskScore) return "worsening";
    if (current.riskScore < previous.riskScore) return "improving";
    return "stable";
  }, [history]);

  if (!patient) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold">Patient Detail</h2>
        <p className="text-sm text-slate-400">Select a patient to view details.</p>
      </div>
    );
  }

  const treatmentRisk = latestRun ? levelDown(latestRun.riskLevel) : "low";

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{patient.name}</h2>
            <p className="text-sm text-slate-300">
              {patient.age ? `${patient.age} yrs` : "Age n/a"} - Priority {patient.priority}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {patient.tags?.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
            <button className="btn-ghost" type="button" onClick={onEdit}>
              Edit Patient
            </button>
          </div>
        </div>
        {latestRun && latestRun.riskLevel === "critical" && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
            Critical event detected. Immediate attention required.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Risk Score</p>
            <p className="mt-1 text-lg font-semibold">
              {latestRun ? `${latestRun.riskLevel} (${latestRun.riskScore})` : "n/a"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Trend</p>
            <p className="mt-1 text-lg font-semibold capitalize">{trendSummary}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Treatment Outcome Simulation</p>
            <p className="mt-1 text-lg font-semibold capitalize">{treatmentRisk}</p>
          </div>
        </div>
      </div>

      <InputPanel
        title="What-if Simulation"
        subtitle="Edit the report and re-run the pipeline."
        value={rawText}
        onChange={setRawText}
        onAnalyze={() => onAnalyze(rawText)}
        onLoadSample={() => setRawText("45-year-old male with chest pain and shortness of breath. BP 150/95, HR 110, temp 37.8. Taking aspirin.")}
        loading={loading}
        actionLabel="Analyze & Save"
        helperText="Re-run analysis to update timeline"
      />

      <div className="flex flex-wrap gap-3">
        <button className="btn-ghost" type="button" onClick={onRunScenario}>
          Run Scenario Set
        </button>
        <button className="btn-ghost" type="button" onClick={onSimulate}>
          Simulate New Report
        </button>
        <button className="btn-primary" type="button" onClick={() => setShowExplain(true)} disabled={!latestRun}>
          Explain Decisions
        </button>
      </div>

      <SummaryCard summary={latestRun?.summary} structured={latestRun?.structured} steps={latestRun?.steps} />
      <RiskAlerts risks={latestRun?.risks || []} />
      <Recommendations recommendations={latestRun?.recommendations || []} />

      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Case Notes</h2>
          <button className="btn-ghost" type="button" onClick={() => onUpdateNotes(notes)}>
            Save Notes
          </button>
        </div>
        <textarea
          className="min-h-[140px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add case notes, observations, or follow-up plans."
        />
      </div>

      <ExplainabilityModal
        open={showExplain}
        onClose={() => setShowExplain(false)}
        items={latestRun?.explainability || []}
      />
    </div>
  );
}
