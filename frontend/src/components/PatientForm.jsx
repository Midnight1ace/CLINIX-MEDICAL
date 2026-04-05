import { useEffect, useState } from "react";

const PRIORITIES = ["low", "medium", "high", "critical"];

export default function PatientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    tags: "",
    priority: "medium",
    notes: ""
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      name: initial.name || "",
      age: initial.age || "",
      tags: (initial.tags || []).join(", "),
      priority: initial.priority || "medium",
      notes: initial.notes || ""
    });
  }, [initial]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {initial ? "Edit Patient" : "Add Patient"}
        </h2>
        {onCancel && (
          <button className="btn-ghost" type="button" onClick={onCancel}>
            Close
          </button>
        )}
      </div>
      <div className="grid gap-3">
        <input
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          placeholder="Full name"
          value={form.name}
          onChange={updateField("name")}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          placeholder="Age"
          value={form.age}
          onChange={updateField("age")}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={updateField("tags")}
        />
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          value={form.priority}
          onChange={updateField("priority")}
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <textarea
          className="min-h-[120px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
          placeholder="Case notes"
          value={form.notes}
          onChange={updateField("notes")}
        />
      </div>
      <button
        className="btn-primary w-full"
        type="button"
        onClick={() => onSave(form)}
      >
        {initial ? "Save Changes" : "Create Patient"}
      </button>
    </div>
  );
}
