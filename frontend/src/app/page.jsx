"use client";

import { useMemo, useState } from "react";
import DoctorShell from "../components/layout/DoctorShell";
import { useClinic } from "../hooks/useClinic";

const STATUS_LABELS = {
  stable: "Stable",
  watch: "Warning",
  urgent: "Warning",
  critical: "Critical"
};

const STATUS_CLASSES = {
  stable: "bg-emerald-50 text-emerald-700",
  watch: "bg-amber-50 text-amber-700",
  urgent: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700"
};

const ALERT_STYLES = [
  "border-red-200 bg-red-50",
  "border-amber-200 bg-amber-50",
  "border-orange-200 bg-orange-50",
  "border-emerald-200 bg-emerald-50"
];

const AGENTS = [
  { name: "Ingestion Agent", status: "Active" },
  { name: "Summary Agent", status: "Active" },
  { name: "Risk Agent", status: "Active" },
  { name: "Recommendation Agent", status: "Active" },
  { name: "Explainability Agent", status: "Active" }
];

function formatPatientId(index) {
  return `P${String(index + 1).padStart(3, "0")}`;
}

function getCondition(run) {
  if (!run) return "Pending";
  const symptom = run.structured?.symptoms?.[0];
  if (symptom) return symptom.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  return "General";
}

function getLastUpdate(run, patient) {
  const stamp = run?.createdAt || patient?.updatedAt || patient?.createdAt;
  if (!stamp) return "n/a";
  return new Date(stamp).toLocaleString();
}

function getStatus(patient) {
  if (!patient) return "stable";
  if (!patient.history?.length) return "pending";
  return patient.status || "stable";
}

function statusLabel(status) {
  if (status === "pending") return "Pending";
  return STATUS_LABELS[status] || "Stable";
}

function statusClass(status) {
  if (status === "pending") return "bg-slate-100 text-slate-500";
  return STATUS_CLASSES[status] || STATUS_CLASSES.stable;
}

function buildSeries(count) {
  const base = Math.max(2, count);
  return [base - 2, base - 1, base, base + 1, base + 2, base + 1, base + 2].map((v) =>
    Math.max(1, v)
  );
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function TrendChart({ series }) {
  const width = 280;
  const height = 120;
  const pad = 12;
  const max = Math.max(...series.flatMap((item) => item.values)) + 2;

  const buildPath = (values) => {
    return values
      .map((value, index) => {
        const x = pad + (index / (values.length - 1)) * (width - pad * 2);
        const y = height - pad - (value / max) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" rx="12" />
      {series.map((item) => (
        <path
          key={item.label}
          d={buildPath(item.values)}
          fill="none"
          stroke={item.color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function Page() {
  const {
    patients,
    alerts,
    clusters,
    selectedPatient,
    addPatient,
    addDocuments,
    runScenarioSet,
    simulateUpdate,
    selectedId,
    setSelectedId
  } = useClinic();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = useMemo(() => {
    const stable = patients.filter((p) => p.status === "stable").length;
    const warning = patients.filter((p) => ["watch", "urgent"].includes(p.status)).length;
    const critical = patients.filter((p) => p.status === "critical").length;
    const pending = patients.filter((p) => !p.history?.length).length;
    return { total: patients.length, stable, warning, critical, pending };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return patients.filter((patient) => {
      const status = getStatus(patient);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!needle) return true;
      const haystack = [patient.name, patient.tags?.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [patients, query, statusFilter]);

  const distributionTotal = Object.values(clusters).reduce((sum, value) => sum + value, 0) || 1;
  const pct = {
    critical: Math.round((clusters.critical / distributionTotal) * 100),
    high: Math.round((clusters.high / distributionTotal) * 100),
    medium: Math.round((clusters.medium / distributionTotal) * 100),
    low: Math.round((clusters.low / distributionTotal) * 100)
  };

  const donutStyle = {
    background: `conic-gradient(#ef4444 0 ${pct.critical}%, #f97316 ${pct.critical}% ${pct.critical + pct.high}%, #fbbf24 ${
      pct.critical + pct.high
    }% ${pct.critical + pct.high + pct.medium}%, #22c55e ${
      pct.critical + pct.high + pct.medium
    }% 100%)`
  };

  const trendSeries = useMemo(() => {
    return [
      { label: "Stable", color: "#22c55e", values: buildSeries(counts.stable) },
      { label: "Warning", color: "#f59e0b", values: buildSeries(counts.warning) },
      { label: "Critical", color: "#ef4444", values: buildSeries(counts.critical) }
    ];
  }, [counts]);

  const documents = selectedPatient?.documents || [];

  const handleDocumentUpload = (event) => {
    const files = event.target.files;
    if (!files?.length) return;
    addDocuments(selectedId, files, "doctor");
    event.target.value = "";
  };

  return (
    <DoctorShell active="dashboard">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Welcome back, Dr. Ananya</h1>
              <p className="text-sm text-slate-500">Here is an overview of your patients and recent alerts.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Search patients..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">AR</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Dr. Ananya Rao</p>
                  <p className="text-slate-400">Cardiology</p>
                </div>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Patients</p>
                  <p className="text-2xl font-semibold">{counts.total}</p>
                  <p className="text-xs text-indigo-500">+12 this week</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  P
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Stable</p>
                  <p className="text-2xl font-semibold">{counts.stable}</p>
                  <p className="text-xs text-slate-400">{counts.total ? Math.round((counts.stable / counts.total) * 100) : 0}% of total</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  S
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Warning</p>
                  <p className="text-2xl font-semibold">{counts.warning}</p>
                  <p className="text-xs text-slate-400">{counts.total ? Math.round((counts.warning / counts.total) * 100) : 0}% of total</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  W
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Critical</p>
                  <p className="text-2xl font-semibold">{counts.critical}</p>
                  <p className="text-xs text-slate-400">{counts.total ? Math.round((counts.critical / counts.total) * 100) : 0}% of total</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  C
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Pending Reports</p>
                  <p className="text-2xl font-semibold">{counts.pending}</p>
                  <p className="text-xs text-slate-400">Awaiting review</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  R
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Patient Overview</h2>
                  <p className="text-xs text-slate-400">Latest patients with status and key information</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Search..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                  />
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="stable">Stable</option>
                    <option value="watch">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() =>
                      addPatient({
                        name: "New Patient",
                        age: 40,
                        tags: "new",
                        priority: "medium",
                        notes: ""
                      })
                    }
                  >
                    Add Patient
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-3">ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Condition</th>
                      <th>Last Update</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => {
                      const run = patient.history?.[0] || null;
                      const status = getStatus(patient);
                      return (
                        <tr
                          key={patient.id}
                          className={`border-t border-slate-100 ${
                            patient.id === selectedId ? "bg-indigo-50" : ""
                          }`}
                        >
                          <td className="py-3 font-semibold text-slate-700">
                            {formatPatientId(index)}
                          </td>
                          <td>{patient.name}</td>
                          <td>{patient.age || "n/a"}</td>
                          <td>{getCondition(run)}</td>
                          <td>{getLastUpdate(run, patient)}</td>
                          <td>
                            <span className={`status-pill ${statusClass(status)}`}>
                              {statusLabel(status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="text-indigo-600 font-semibold"
                              type="button"
                              onClick={() => setSelectedId(patient.id)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Showing {filteredPatients.length} of {patients.length} patients
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recent Alerts</h2>
                  <button className="text-xs font-semibold text-indigo-600" type="button">
                    View All
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {alerts.slice(0, 4).map((item, index) => (
                    <div
                      key={item.run.id}
                      className={`rounded-xl border px-3 py-3 text-sm ${ALERT_STYLES[index % ALERT_STYLES.length]}`}
                    >
                      <p className="font-semibold text-slate-800">{item.patient.name}</p>
                      <p className="text-xs text-slate-500">
                        Risk {item.run.riskLevel} - {item.run.summary}
                      </p>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-sm text-slate-400">No alerts yet.</p>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="mt-4 grid gap-3">
                  <button
                    className="card-soft p-3 text-left"
                    type="button"
                    onClick={() =>
                      addPatient({
                        name: "New Patient",
                        age: 50,
                        tags: "quick",
                        priority: "medium",
                        notes: ""
                      })
                    }
                  >
                    <p className="text-sm font-semibold text-slate-800">Add Patient</p>
                    <p className="text-xs text-slate-400">Register a new patient</p>
                  </button>
                  <button
                    className="card-soft p-3 text-left"
                    type="button"
                    onClick={() => runScenarioSet(selectedId, 3)}
                  >
                    <p className="text-sm font-semibold text-slate-800">Run Simulation</p>
                    <p className="text-xs text-slate-400">What-if analysis</p>
                  </button>
                  <button
                    className="card-soft p-3 text-left"
                    type="button"
                    onClick={() => simulateUpdate(selectedId)}
                  >
                    <p className="text-sm font-semibold text-slate-800">Generate Report</p>
                    <p className="text-xs text-slate-400">Create latest summary</p>
                  </button>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Patient Documents</h2>
                  <span className="text-xs text-slate-400">
                    {selectedPatient ? selectedPatient.name : "No patient selected"}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <input
                    type="file"
                    multiple
                    disabled={!selectedPatient}
                    onChange={handleDocumentUpload}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-slate-400">Uploads are stored locally in this demo.</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {documents.length ? (
                    documents.slice(0, 4).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                        <div>
                          <p className="font-semibold text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-400">
                            {doc.type || "file"} • {formatBytes(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600">
                          {doc.source || "doctor"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">AI Agents Status</h2>
                  <span className="text-xs text-emerald-600">All Systems Operational</span>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {AGENTS.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between">
                      <span className="text-slate-600">{agent.name}</span>
                      <span className="text-emerald-600">{agent.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_2fr]">
            <div className="card p-5">
              <h2 className="text-lg font-semibold">Risk Distribution</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-32 w-32">
                  <div className="h-32 w-32 rounded-full" style={donutStyle} />
                  <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{counts.total}</p>
                      <p className="text-xs text-slate-400">Total Patients</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                    {pct.low}% Stable
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400 mr-2" />
                    {pct.medium}% Warning
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-400 mr-2" />
                    {pct.high}% High
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2" />
                    {pct.critical}% Critical
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Patient Trends (Last 7 Days)</h2>
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <option>Risk Level</option>
                </select>
              </div>
              <div className="mt-4">
                <TrendChart series={trendSeries} />
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  {trendSeries.map((series) => (
                    <span key={series.label} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      {series.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
      </section>
    </DoctorShell>
  );
}
