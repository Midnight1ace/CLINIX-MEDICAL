"use client";

import { useState } from "react";
import DoctorShell from "../../components/DoctorShell";
import InputPanel from "../../components/InputPanel";
import { useClinic } from "../../hooks/useClinic";

const SAMPLE_NOTE =
  "45-year-old male with chest pain and shortness of breath. BP 150/95, HR 110, temp 37.8. Taking aspirin.";

export default function SimulationPage() {
  const {
    patients,
    selectedId,
    setSelectedId,
    analyzeForPatient,
    runScenarioSet,
    simulateUpdate,
    loading
  } = useClinic();
  const [rawText, setRawText] = useState(SAMPLE_NOTE);

  const handleAnalyze = () => {
    if (!selectedId) return;
    analyzeForPatient(selectedId, rawText);
  };

  return (
    <DoctorShell active="simulation">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Analytics</p>
          <h1 className="text-2xl font-semibold">Simulation Lab</h1>
          <p className="text-sm text-slate-500">
            Run what-if analyses and generate new reports.
          </p>
        </div>
      </header>

      <section className="mt-6 space-y-4">
        <div className="card p-4">
          <label className="text-sm text-slate-600">
            Select patient
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={selectedId || ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              <option value="">Choose a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <InputPanel
          title="What-if Simulation"
          subtitle="Edit notes and re-run the pipeline."
          value={rawText}
          onChange={setRawText}
          onAnalyze={handleAnalyze}
          onLoadSample={() => setRawText(SAMPLE_NOTE)}
          loading={loading}
          actionLabel="Analyze"
          helperText="Updates the patient timeline"
        />

        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost" type="button" onClick={() => runScenarioSet(selectedId, 3)}>
            Run Scenario Set
          </button>
          <button className="btn-ghost" type="button" onClick={() => simulateUpdate(selectedId)}>
            Simulate New Report
          </button>
        </div>
      </section>
    </DoctorShell>
  );
}
