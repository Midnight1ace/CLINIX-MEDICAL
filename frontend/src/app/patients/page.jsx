"use client";

import { useMemo } from "react";
import DoctorShell from "../../components/layout/DoctorShell";
import { useClinic } from "../../hooks/useClinic";

const STATUS_CLASSES = {
  stable: "bg-emerald-50 text-emerald-700",
  watch: "bg-amber-50 text-amber-700",
  urgent: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700"
};

function statusClass(status) {
  return STATUS_CLASSES[status] || STATUS_CLASSES.stable;
}

export default function PatientsPage() {
  const { patients, selectedId, setSelectedId, selectedPatient, latestRun } = useClinic();

  const activePatient = useMemo(() => {
    if (selectedPatient) return selectedPatient;
    return patients[0] || null;
  }, [patients, selectedPatient]);

  return (
    <DoctorShell active="patients">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Patients</p>
          <h1 className="text-2xl font-semibold">Patient Directory</h1>
          <p className="text-sm text-slate-500">Search, review, and select a patient.</p>
        </div>
        <div className="text-xs text-slate-400">
          {patients.length} total patients
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Patients</h2>
            <span className="text-xs text-slate-400">Click a row to view</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Age</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={`border-t border-slate-100 cursor-pointer ${
                      patient.id === selectedId ? "bg-indigo-50" : ""
                    }`}
                    onClick={() => setSelectedId(patient.id)}
                  >
                    <td className="py-3 font-semibold text-slate-800">{patient.name}</td>
                    <td>{patient.age || "n/a"}</td>
                    <td className="capitalize">{patient.priority}</td>
                    <td>
                      <span className={`status-pill ${statusClass(patient.status)}`}>
                        {patient.status || "stable"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!patients.length && (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={4}>
                      No patients yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Selected Patient</h2>
            <p className="text-xs text-slate-400">Summary snapshot</p>
          </div>
          {!activePatient && <p className="text-sm text-slate-400">Select a patient to view details.</p>}
          {activePatient && (
            <>
              <div>
                <p className="text-xl font-semibold">{activePatient.name}</p>
                <p className="text-sm text-slate-500">
                  {activePatient.age ? `${activePatient.age} yrs` : "Age n/a"} • Priority{" "}
                  {activePatient.priority}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(activePatient.tags || []).map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="text-xs text-slate-400">Latest Summary</p>
                <p className="mt-2 text-slate-700">
                  {latestRun?.summary || "No analysis run yet."}
                </p>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`status-pill ${statusClass(activePatient.status)}`}>
                    {activePatient.status || "stable"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Documents</span>
                  <span className="font-semibold text-slate-700">
                    {activePatient.documents?.length || 0}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </DoctorShell>
  );
}
