"use client";

import DoctorShell from "../../components/layout/DoctorShell";

const PIPELINE_STEPS = [
  "Ingestion Agent → parse raw text into structured PatientData",
  "Clinical Summary Agent → readable summary string",
  "Risk Detection Agent → rule-based RiskItem list",
  "Recommendation Agent → next-step guidance",
  "Explainability Agent → traceability statements"
];

const RULES = [
  {
    signal: "Blood pressure (systolic)",
    threshold: ">= 180",
    level: "high",
    title: "Severely elevated blood pressure"
  },
  {
    signal: "Blood pressure (diastolic)",
    threshold: ">= 120",
    level: "high",
    title: "Severely elevated blood pressure"
  },
  {
    signal: "Blood pressure (systolic)",
    threshold: ">= 140",
    level: "medium",
    title: "Elevated blood pressure"
  },
  {
    signal: "Blood pressure (diastolic)",
    threshold: ">= 90",
    level: "medium",
    title: "Elevated blood pressure"
  },
  { signal: "Heart rate", threshold: ">= 100", level: "medium", title: "Tachycardia" },
  { signal: "Temperature (C)", threshold: ">= 38.0", level: "medium", title: "Fever" },
  { signal: "Symptom: chest pain", threshold: "keyword present", level: "high", title: "Chest pain" },
  {
    signal: "Symptom: shortness of breath",
    threshold: "keyword present",
    level: "high",
    title: "Shortness of breath"
  },
  { signal: "Age", threshold: ">= 65", level: "low", title: "Older age" }
];

const FEATURES = [
  { name: "Patient dashboard (list + status)", status: "Done" },
  { name: "Patient detail view", status: "Done" },
  { name: "Summary (conditions, meds, vitals)", status: "Done", notes: "Pipeline summary output" },
  { name: "Risk detection", status: "Done" },
  { name: "Recommendations", status: "Done" },
  { name: "Explainability (“why”)", status: "Done" },
  { name: "Timeline (history over time)", status: "Done" },
  { name: "Trend detection (improving / worsening)", status: "Done" },
  { name: "Critical event detection", status: "Partial", notes: "Basic logic exists, needs expansion" },
  { name: "Auto-prioritization of patients", status: "Done" },
  { name: "Risk scoring system (low → critical)", status: "Done" },
  { name: "Multi-condition correlation (e.g. BP + symptoms)", status: "Done" },
  { name: "What-if simulation (edit inputs)", status: "Done" },
  { name: "Scenario simulation (multiple cases)", status: "Done" },
  { name: "Live data updates (new reports)", status: "Partial", notes: "Basic refresh behavior only" },
  { name: "Predictive risk (future risk estimation)", status: "Partial", notes: "Early version only" },
  { name: "Treatment outcome simulation", status: "Partial", notes: "Early version only" },
  { name: "Alert sensitivity control (adjust thresholds)", status: "Done" },
  { name: "Explainability panel", status: "Done" },
  { name: "Step-by-step agent reasoning", status: "Done" },
  { name: "Confidence scores", status: "Done" },
  { name: "Highlighted data triggers", status: "Done" },
  { name: "Rule vs AI decision breakdown", status: "Done" },
  { name: "Add / edit patients", status: "Done" },
  { name: "Patient history logs", status: "Done" },
  { name: "Case notes section", status: "Done" },
  { name: "Patient document upload", status: "Done", notes: "Local upload stored in browser storage" },
  { name: "Tag patients (critical, follow-up, etc.)", status: "Done" },
  { name: "Assign priority levels", status: "Done" },
  { name: "Charts (BP, heart rate, etc.)", status: "Partial", notes: "Basic charts only" },
  { name: "Risk level graphs", status: "Done" },
  { name: "Timeline visualization", status: "Done" },
  { name: "Comparison charts (patient vs patient)", status: "Partial", notes: "Basic comparison only" },
  { name: "Pattern detection (recurring issues)", status: "Done" },
  { name: "Anomaly detection", status: "Done" },
  { name: "Similar case suggestions", status: "Done" },
  { name: "Risk clustering (group patients by risk)", status: "Done" },
  { name: "Real-time alerts", status: "Partial", notes: "Basic notifications only" },
  { name: "Critical warnings panel", status: "Done" },
  { name: "Alert history log", status: "Done" },
  { name: "Smart alert filtering (reduce noise)", status: "Done" },
  { name: "Compare patients side-by-side", status: "Done" },
  { name: "Case comparison insights", status: "Partial", notes: "Basic insights only" },
  { name: "Export report (PDF-style)", status: "Partial", notes: "Basic export only" },
  { name: "Auto-generated clinical summary", status: "Done", notes: "Pipeline summary output" },
  { name: "Shareable report view", status: "Partial", notes: "Basic sharing only" },
  { name: "Multi-agent reasoning view", status: "Done" },
  { name: "Step-by-step pipeline visualization", status: "Done" },
  { name: "Re-run analysis button", status: "Done" },
  { name: "Version history (before/after changes)", status: "Partial", notes: "Early version only" },
  { name: "Role-based view (doctor/admin)", status: "Planned", notes: "Not built yet" },
  { name: "Local data storage (privacy-focused)", status: "Done", notes: "Browser local storage in demo" },
  { name: "Offline mode (basic functionality)", status: "Partial", notes: "Limited offline support" }
];

const PAIN_POINTS = [
  {
    title: "Fragmented / Messy Patient Data",
    problem: "Data in different formats (PDFs, notes, systems) that is hard to read and inconsistent.",
    solution: "Smart Patient Profile that auto-structures and standardizes data.",
    result: "One clean, unified patient record."
  },
  {
    title: "Missed Allergies / Medication Errors",
    problem: "Allergy information can be missed, leading to wrong prescriptions.",
    solution: "Risk Detection Engine that cross-checks medications versus allergies.",
    result: "Instant danger alerts."
  },
  {
    title: "Time Pressure on Doctors",
    problem: "Too many patients and no time to read long records.",
    solution: "Instant AI Summary.",
    result: "Key info in seconds."
  },
  {
    title: "Poor Patient Prioritization (Triage)",
    problem: "Critical patients not identified fast; wrong treatment order.",
    solution: "AI Triage System.",
    result: "Clear critical / warning / stable levels."
  },
  {
    title: "Lack of Clear Insights",
    problem: "Data exists but no clear conclusions.",
    solution: "Clinical Insight Engine.",
    result: "Actionable guidance like “Check this” or “Possible risk: X.”"
  },
  {
    title: "Repeated Tests",
    problem: "Same tests done again, wasting time and cost.",
    solution: "Duplicate Test Detection.",
    result: "Alerts when tests were already done recently."
  },
  {
    title: "High Admin / Paperwork Load",
    problem: "Manual data entry overwhelms staff.",
    solution: "Auto data extraction and structuring.",
    result: "Less manual work."
  },
  {
    title: "Poor Communication Between Departments",
    problem: "Data not shared clearly, causing misunderstandings.",
    solution: "Standardized summaries and shared view.",
    result: "Everyone sees the same clear info."
  },
  {
    title: "Poor Patient Flow (Bottlenecks)",
    problem: "Too many patients in one area, delaying treatment.",
    solution: "Smart dashboard with AI prioritization.",
    result: "Better distribution of attention."
  },
  {
    title: "Cognitive Overload",
    problem: "Too many variables to process at once.",
    solution: "AI highlights only important info.",
    result: "Faster, clearer decisions."
  },
  {
    title: "Human Errors",
    problem: "Missed details and wrong assumptions.",
    solution: "Risk alerts and validation checks.",
    result: "Reduced mistakes."
  },
  {
    title: "Lack of Predictive Awareness",
    problem: "Reacting too late to emerging problems.",
    solution: "Predictive risk analysis.",
    result: "Early warnings."
  },
  {
    title: "No Simulation Before Decisions",
    problem: "Clinicians can’t test scenarios safely.",
    solution: "What-if simulation.",
    result: "“If we change X, what happens?”"
  },
  {
    title: "Inefficient Resource Use",
    problem: "Staff and time wasted.",
    solution: "AI-driven prioritization.",
    result: "Better efficiency."
  }
];

const REQUEST_EXAMPLE = `{
  "raw_text": "72-year-old female with chest pain and shortness of breath. BP 150/95, HR 112, temp 38.2. Taking aspirin and lisinopril."
}`;

const RESPONSE_EXAMPLE = `{
  "steps": [
    "Ingestion Agent",
    "Clinical Summary Agent",
    "Risk Detection Agent",
    "Recommendation Agent",
    "Explainability Agent"
  ],
  "structured": {
    "age": 72,
    "symptoms": ["chest pain", "shortness of breath"],
    "vitals": {
      "bp_systolic": 150,
      "bp_diastolic": 95,
      "heart_rate": 112,
      "temperature_c": 38.2
    },
    "medications": ["aspirin", "lisinopril"],
    "notes": "72-year-old female with chest pain and shortness of breath. BP 150/95, HR 112, temp 38.2. Taking aspirin and lisinopril."
  },
  "summary": "72-year-old patient. Symptoms: chest pain, shortness of breath. Vitals: BP 150/95, HR 112, Temp 38.2C. Medications: aspirin, lisinopril.",
  "risks": [
    { "level": "medium", "title": "Elevated blood pressure", "rationale": "BP 150/95 exceeds 140/90.", "source": "rule" },
    { "level": "medium", "title": "Tachycardia", "rationale": "Heart rate 112 is above 100.", "source": "rule" },
    { "level": "medium", "title": "Fever", "rationale": "Temperature 38.2C is above 38.0C.", "source": "rule" },
    { "level": "high", "title": "Chest pain", "rationale": "Chest pain can indicate acute cardiac risk.", "source": "rule" },
    { "level": "high", "title": "Shortness of breath", "rationale": "Dyspnea is a high-priority respiratory/cardiac warning sign.", "source": "rule" },
    { "level": "low", "title": "Older age", "rationale": "Age 72 increases baseline risk.", "source": "rule" }
  ],
  "recommendations": [
    "Obtain ECG and cardiac biomarkers.",
    "Assess for acute coronary syndrome and consider ER evaluation.",
    "Recheck blood pressure and evaluate for hypertension management.",
    "Assess for causes of tachycardia (pain, fever, dehydration).",
    "Consider infection workup and hydration guidance.",
    "Check oxygen saturation and consider chest imaging."
  ],
  "explainability": [
    "Elevated blood pressure: BP 150/95 exceeds 140/90.",
    "Tachycardia: Heart rate 112 is above 100.",
    "Fever: Temperature 38.2C is above 38.0C.",
    "Chest pain: Chest pain can indicate acute cardiac risk.",
    "Shortness of breath: Dyspnea is a high-priority respiratory/cardiac warning sign.",
    "Older age: Age 72 increases baseline risk.",
    "Chest pain triggered ECG recommendation to rule out cardiac causes.",
    "BP 150/95 led to hypertension follow-up guidance.",
    "Dyspnea prompted oxygen saturation check."
  ]
}`;

export default function SystemDocsPage() {
  return (
    <DoctorShell active="system-docs">
      <header className="border-b border-slate-200 bg-white py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-slate-400">System Docs</p>
            <h1 className="text-2xl font-semibold">CLINIX Master Overview</h1>
            <p className="text-sm text-slate-500">
              Canonical flow, contracts, rules, and feature catalog.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Demo-only documentation. Not for clinical use.
          </div>
        </div>
      </header>

      <div className="py-8 space-y-6">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5 space-y-2">
            <h2 className="text-lg font-semibold">Purpose & Disclaimer</h2>
            <p className="text-sm text-slate-600">
              CLINIX is a multi-agent clinical decision support demo. Outputs are informational
              only and are not intended for diagnosis or treatment decisions.
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="text-lg font-semibold">System Context</h2>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Frontend: Next.js dashboard for risks, recommendations, explainability.</li>
              <li>Backend: FastAPI pipeline exposing `POST /api/analyze`.</li>
              <li>Data: Mock patient records + user-entered notes.</li>
              <li>LLM: Optional wiring exists, not used by agents yet.</li>
            </ul>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold">End-to-End Pipeline</h2>
          <p className="text-sm text-slate-500">
            Orchestrator runs each agent in order and returns one response payload.
          </p>
          <div className="mt-4 grid gap-2">
            {PIPELINE_STEPS.map((step) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Clinical Pain Points & AI Solutions</h2>
            <div className="text-xs text-slate-400">Problem → Solution → Result</div>
          </div>
          <div className="mt-4 grid gap-4">
            {PAIN_POINTS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-500">Problem: {item.problem}</p>
                <p className="mt-1 text-xs text-slate-600">AI Solution: {item.solution}</p>
                <p className="mt-1 text-xs text-slate-500">Result: {item.result}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Request Contract</h2>
            <pre className="mt-3 rounded-xl bg-slate-900 p-4 text-xs text-slate-100 overflow-x-auto">
              {REQUEST_EXAMPLE}
            </pre>
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Response Contract</h2>
            <pre className="mt-3 rounded-xl bg-slate-900 p-4 text-xs text-slate-100 overflow-x-auto">
              {RESPONSE_EXAMPLE}
            </pre>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold">Rules & Thresholds</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Signal</th>
                  <th>Threshold</th>
                  <th>Risk Level</th>
                  <th>Risk Title</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((rule) => (
                  <tr key={`${rule.signal}-${rule.threshold}`} className="border-t border-slate-100">
                    <td className="py-2">{rule.signal}</td>
                    <td>{rule.threshold}</td>
                    <td className="font-semibold text-slate-700">{rule.level}</td>
                    <td>{rule.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Feature Catalog</h2>
            <div className="text-xs text-slate-400">
              Status: Done / Partial / Planned
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Feature</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature) => {
                  const note =
                    feature.notes ||
                    (feature.status === "Done"
                      ? "Listed as implemented in the demo UI"
                      : feature.status === "Partial"
                        ? "Basic version only"
                        : "Not built yet");
                  return (
                    <tr key={feature.name} className="border-t border-slate-100">
                      <td className="py-2">{feature.name}</td>
                      <td className="font-semibold text-slate-700">{feature.status}</td>
                      <td className="text-slate-500">{note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DoctorShell>
  );
}
