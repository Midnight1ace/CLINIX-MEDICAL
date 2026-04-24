"use client";

import DoctorShell from "../../components/layout/DoctorShell";
import AlertsPanel from "../../components/panels/AlertsPanel";
import { useClinic } from "../../hooks/useClinic";

export default function AlertsPage() {
  const { alerts, alertThreshold, setAlertThreshold, liveMode, setLiveMode } = useClinic();

  return (
    <DoctorShell active="alerts">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Analytics</p>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-sm text-slate-500">Monitor high-risk patients and warnings.</p>
        </div>
      </header>

      <section className="mt-6">
        <AlertsPanel
          alerts={alerts}
          threshold={alertThreshold}
          onThresholdChange={setAlertThreshold}
          liveMode={liveMode}
          onLiveToggle={() => setLiveMode(!liveMode)}
        />
      </section>
    </DoctorShell>
  );
}
