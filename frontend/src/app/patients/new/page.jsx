"use client";

import { useState } from "react";
import DoctorShell from "../../../components/layout/DoctorShell";
import { useClinic } from "../../../hooks/useClinic";

const PRIORITIES = ["low", "medium", "high", "critical"];

export default function AddPatientPage() {
  const { addPatient } = useClinic();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    tags: "",
    priority: "medium",
    notes: ""
  });

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    addPatient(form);
    setSaved(true);
    setForm({ name: "", age: "", tags: "", priority: "medium", notes: "" });
  };

  return (
    <DoctorShell active="add-patient">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Patients</p>
          <h1 className="text-2xl font-semibold">Add Patient</h1>
          <p className="text-sm text-slate-500">Create a new patient profile.</p>
        </div>
        {saved && <span className="text-xs font-semibold text-emerald-600">Patient created</span>}
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-5 space-y-4">
          <div className="grid gap-3">
            <label className="text-sm text-slate-600">
              Full name
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.name}
                onChange={updateField("name")}
                placeholder="Patient name"
                autoComplete="name"
              />
            </label>
            <label className="text-sm text-slate-600">
              Age
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.age}
                onChange={updateField("age")}
                placeholder="Age"
                autoComplete="bday-year"
                type="number"
              />
            </label>
            <label className="text-sm text-slate-600">
              Tags
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.tags}
                onChange={updateField("tags")}
                placeholder="cardio, follow-up"
                autoComplete="off"
              />
            </label>
            <label className="text-sm text-slate-600">
              Priority
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.priority}
                onChange={updateField("priority")}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Notes
              <textarea
                className="mt-2 w-full min-h-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.notes}
                onChange={updateField("notes")}
                placeholder="Case notes or initial observations."
                autoComplete="off"
              />
            </label>
          </div>
          <button className="btn-primary w-full" type="button" onClick={handleSave}>
            Create Patient
          </button>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="text-lg font-semibold">Tips</h2>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>Use tags to organize patients by condition or clinic.</li>
            <li>Priority can be updated automatically by the AI pipeline.</li>
            <li>Notes are visible on the patient detail view.</li>
          </ul>
        </div>
      </section>
    </DoctorShell>
  );
}
