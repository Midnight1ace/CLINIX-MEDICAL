import { useEffect, useMemo, useState } from "react";

function PatientSnapshot({ patient }) {
  if (!patient) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
        Select a patient.
      </div>
    );
  }

  const run = patient.history?.[0];

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-100">{patient.name}</p>
        <p className="text-xs text-slate-400">
          {patient.age ? `${patient.age} yrs` : "Age n/a"} - Priority {patient.priority}
        </p>
      </div>
      <p className="text-xs text-slate-300">{run?.summary || "No summary"}</p>
      {run && (
        <div className="text-xs text-slate-400">
          Risk: <span className="text-slate-200 capitalize">{run.riskLevel}</span> ({run.riskScore})
        </div>
      )}
    </div>
  );
}

export default function ComparisonPanel({ patients }) {
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
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Patient Comparison</h2>
        <span className="text-xs text-slate-400">Side-by-side insight</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
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
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
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
        <PatientSnapshot patient={leftPatient} />
        <PatientSnapshot patient={rightPatient} />
      </div>
    </div>
  );
}
