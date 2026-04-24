"use client";

import DoctorShell from "../../components/layout/DoctorShell";
import { useClinic } from "../../hooks/useClinic";

export default function SettingsPage() {
  const {
    alertThreshold,
    setAlertThreshold,
    autoPriority,
    setAutoPriority,
    liveMode,
    setLiveMode
  } = useClinic();

  return (
    <DoctorShell active="settings">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">System</p>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-slate-500">Tune alerting and automation behavior.</p>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Automation</h2>
          <label className="flex items-center justify-between text-sm text-slate-600">
            Auto-prioritize patients
            <input
              type="checkbox"
              checked={autoPriority}
              onChange={(event) => setAutoPriority(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between text-sm text-slate-600">
            Live monitoring mode
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(event) => setLiveMode(event.target.checked)}
            />
          </label>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Alert Sensitivity</h2>
          <input
            type="range"
            min={1}
            max={6}
            value={alertThreshold}
            onChange={(event) => setAlertThreshold(Number(event.target.value))}
            className="w-full"
          />
          <p className="text-sm text-slate-500">
            Alert threshold set to {alertThreshold}. Higher values show fewer alerts.
          </p>
        </div>
      </section>
    </DoctorShell>
  );
}
