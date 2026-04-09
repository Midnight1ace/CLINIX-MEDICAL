"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "../../utils/auth";

const FALLBACK_PATIENT = {
  id: "P001",
  name: "Jordan Lee",
  age: 45,
  status: "watch",
  tags: ["cardio", "follow-up"],
  notes: "Continue monitoring blood pressure and chest discomfort.",
  documents: [],
  history: [
    {
      id: "run_1",
      createdAt: new Date().toISOString(),
      summary: "Chest pain with elevated BP and tachycardia. Requires close monitoring.",
      structured: {
        symptoms: ["chest pain", "shortness of breath"],
        vitals: { bp_systolic: 150, bp_diastolic: 95, heart_rate: 110, temperature_c: 37.8 },
        medications: ["aspirin"]
      },
      risks: [
        { title: "Chest pain", level: "high", rationale: "Potential cardiac event" },
        { title: "Elevated blood pressure", level: "medium", rationale: "BP 150/95" }
      ],
      recommendations: [
        "Obtain ECG and cardiac biomarkers.",
        "Follow-up within 24 hours for vitals check."
      ]
    }
  ]
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}`;
}

function buildPortalId(index) {
  return `P${String(index + 1).padStart(3, "0")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function safeParsePatients() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("clinix_patients_v1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function statusLabel(status) {
  if (status === "critical") return "Critical";
  if (status === "urgent") return "Warning";
  if (status === "watch") return "Warning";
  return "Stable";
}

function statusClass(status) {
  if (status === "critical") return "bg-red-50 text-red-700";
  if (status === "urgent") return "bg-orange-50 text-orange-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

export default function PatientPortal() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [requestedId, setRequestedId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientIndex, setPatientIndex] = useState(0);
  const [patient, setPatient] = useState(FALLBACK_PATIENT);
  const [portalId, setPortalId] = useState("P001");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "patient") {
      router.replace("/login");
      return;
    }
    setRequestedId(auth.patientId || null);
    setAuthReady(true);
  }, [router]);

  useEffect(() => {
    const patients = safeParsePatients();
    if (patients && patients.length) {
      const normalized = patients.map((entry) => ({
        documents: [],
        ...entry,
        documents: entry.documents || []
      }));
      let index = 0;
      if (requestedId) {
        const portalIds = normalized.map((_, idx) => buildPortalId(idx));
        const byPortal = portalIds.indexOf(requestedId.toUpperCase());
        const byId = normalized.findIndex((item) => item.id === requestedId);
        index = byId >= 0 ? byId : byPortal >= 0 ? byPortal : 0;
      }
      setPatients(normalized);
      setPatientIndex(index);
      setPatient(normalized[index]);
      setPortalId(buildPortalId(index));
    }
  }, [requestedId]);

  const latestRun = useMemo(() => patient.history?.[0] || null, [patient]);
  const documents = patient.documents || [];

  const vitals = latestRun?.structured?.vitals || {};
  const meds = latestRun?.structured?.medications || [];

  const downloadSummary = () => {
    const payload = {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        status: patient.status
      },
      summary: latestRun?.summary,
      recommendations: latestRun?.recommendations || []
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "patient-summary.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDocumentUpload = (event) => {
    const files = event.target.files;
    if (!files?.length) return;
    const entries = Array.from(files).map((file) => ({
      id: createId(),
      name: file.name,
      type: file.type || "unknown",
      size: file.size || 0,
      uploadedAt: nowIso(),
      source: "patient"
    }));
    const basePatients = patients.length ? patients : [patient];
    const nextPatients = basePatients.map((item, index) => {
      if (index !== patientIndex) return item;
      const existing = item.documents || [];
      return {
        ...item,
        documents: [...entries, ...existing],
        updatedAt: nowIso()
      };
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("clinix_patients_v1", JSON.stringify(nextPatients));
    }
    setPatients(nextPatients);
    setPatient(nextPatients[patientIndex]);
    event.target.value = "";
  };

  if (!authReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-slate-400">Patient Portal</p>
            <h1 className="text-2xl font-semibold">Welcome, {patient.name}</h1>
            <p className="text-sm text-slate-500">Your latest health updates and care plan.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="chip">Portal ID {portalId}</span>
            <span className={`status-pill ${statusClass(patient.status)}`}>
              {statusLabel(patient.status)}
            </span>
            <button className="btn-primary" type="button" onClick={downloadSummary}>
              Download Summary
            </button>
          </div>
        </div>
      </header>

      <main className="px-8 py-8 space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="text-lg font-semibold">Latest Summary</h2>
              <p className="mt-2 text-sm text-slate-600">
                {latestRun?.summary || "No summary available yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(latestRun?.structured?.symptoms || []).map((symptom) => (
                  <span key={symptom} className="chip">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">Care Plan</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {(latestRun?.recommendations || []).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <span>{item}</span>
                  </li>
                ))}
                {!latestRun?.recommendations?.length && (
                  <li>No recommendations yet.</li>
                )}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">Documents</h2>
              <p className="mt-2 text-sm text-slate-600">
                Upload lab results, scans, or notes to keep your care team in sync.
              </p>
              <input
                type="file"
                multiple
                onChange={handleDocumentUpload}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <div className="mt-4 space-y-2 text-sm">
                {documents.length ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-slate-100 px-3 py-2">
                      <p className="font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">
                        {doc.type || "file"} • {formatBytes(doc.size)} •{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Files are stored locally in this demo environment.
              </p>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  Nurse: Please log any new symptoms in your next check-in.
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  Doctor: Schedule your follow-up appointment within 24 hours.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="text-lg font-semibold">Vitals Snapshot</h2>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Blood Pressure</span>
                  <span className="font-semibold text-slate-800">
                    {vitals.bp_systolic && vitals.bp_diastolic
                      ? `${vitals.bp_systolic}/${vitals.bp_diastolic}`
                      : "n/a"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Heart Rate</span>
                  <span className="font-semibold text-slate-800">
                    {vitals.heart_rate ? `${vitals.heart_rate} bpm` : "n/a"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Temperature</span>
                  <span className="font-semibold text-slate-800">
                    {vitals.temperature_c ? `${vitals.temperature_c} C` : "n/a"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">Medications</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {meds.length ? (
                  meds.map((med) => (
                    <span key={med} className="chip">
                      {med}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No medications listed.</span>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">Upcoming Appointment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Next check-in scheduled within 24 hours. Contact the clinic if symptoms worsen.
              </p>
              <button className="btn-ghost mt-4" type="button">
                Request Reschedule
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Care Team</h2>
            <p className="mt-2 text-sm text-slate-600">Dr. Ananya Rao (Cardiology)</p>
            <p className="text-sm text-slate-600">Nurse Manager: Lila Jacobs</p>
            <button className="btn-primary mt-4" type="button">
              Message Care Team
            </button>
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Latest Alerts</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(latestRun?.risks || []).map((risk) => (
                <li key={risk.title}>
                  {risk.title} - {risk.rationale}
                </li>
              ))}
              {!latestRun?.risks?.length && <li>No alerts at this time.</li>}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Self Check</h2>
            <p className="mt-2 text-sm text-slate-600">
              Log any new symptoms or changes in your condition.
            </p>
            <button className="btn-ghost mt-4" type="button">
              Start Check-in
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
