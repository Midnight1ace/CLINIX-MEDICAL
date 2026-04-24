"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorShell from "../../../components/layout/DoctorShell";
import { useClinic } from "../../../hooks/useClinic";

export default function ComparePatientsPage() {
  const { patients } = useClinic();
  const [leftId, setLeftId] = useState(patients[0]?.id || "");
  const [rightId, setRightId] = useState(patients[1]?.id || "");

  useEffect(() => {
    if (!leftId && patients[0]) {
      setLeftId(patients[0].id);
    }
    if (!rightId && patients[1]) {
      setRightId(patients[1].id);
    }
  }, [patients, leftId, rightId]);

  const leftPatient = useMemo(
    () => patients.find((patient) => patient.id === leftId),
    [patients, leftId]
  );
  const rightPatient = useMemo(
    () => patients.find((patient) => patient.id === rightId),
    [patients, rightId]
  );

  return (
    <DoctorShell active="compare">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Patients</p>
          <h1 className="text-2xl font-semibold">Compare Patients</h1>
          <p className="text-sm text-slate-500">Side-by-side insights for two patients.</p>
        </div>
      </header>

      <section className="mt-6 card p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={leftId}
            onChange={(event) => setLeftId(event.target.value)}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={rightId}
            onChange={(event) => setRightId(event.target.value)}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {leftPatient ? leftPatient.name : "Select a patient"}
            </p>
            {leftPatient && (
              <>
                <p className="text-xs text-slate-500">
                  {leftPatient.age ? `${leftPatient.age} yrs` : "Age n/a"} • Priority{" "}
                  {leftPatient.priority}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {leftPatient.history?.[0]?.summary || "No summary available."}
                </p>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              {rightPatient ? rightPatient.name : "Select a patient"}
            </p>
            {rightPatient && (
              <>
                <p className="text-xs text-slate-500">
                  {rightPatient.age ? `${rightPatient.age} yrs` : "Age n/a"} • Priority{" "}
                  {rightPatient.priority}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {rightPatient.history?.[0]?.summary || "No summary available."}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </DoctorShell>
  );
}
