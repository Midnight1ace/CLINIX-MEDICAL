import { useMemo, useState } from "react";

const statusStyles = {
  stable: "bg-emerald-400/20 text-emerald-200",
  watch: "bg-amber-400/20 text-amber-200",
  urgent: "bg-orange-400/20 text-orange-200",
  critical: "bg-red-500/20 text-red-200"
};

export default function PatientList({ patients, selectedId, onSelect, onAdd, onRemove }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return patients;
    return patients.filter((patient) => {
      const haystack = [
        patient.name,
        patient.tags?.join(" "),
        patient.priority,
        patient.status
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [patients, query]);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Patient Dashboard</h2>
          <p className="text-xs text-slate-300">List + status overview</p>
        </div>
        <button className="btn-primary" type="button" onClick={onAdd}>
          New Patient
        </button>
      </div>
      <input
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
        placeholder="Search patients, tags, priority..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {filtered.map((patient) => {
          const lastRun = patient.history?.[0];
          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSelect(patient.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                selectedId === patient.id
                  ? "border-emerald-400/60 bg-emerald-500/10"
                  : "border-white/10 bg-black/20 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{patient.name}</p>
                  <p className="text-xs text-slate-400">
                    {patient.age ? `${patient.age} yrs` : "Age n/a"} - Priority {patient.priority}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wide ${
                    statusStyles[patient.status] || statusStyles.stable
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(patient.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
                {lastRun && (
                  <span className="chip">Risk {lastRun.riskLevel}</span>
                )}
              </div>
              {lastRun && (
                <p className="mt-2 text-xs text-slate-400">
                  Last report {new Date(lastRun.createdAt).toLocaleString()}
                </p>
              )}
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-red-300 hover:text-red-200"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(patient.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </button>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-slate-400">No patients found.</p>
        )}
      </div>
    </div>
  );
}
