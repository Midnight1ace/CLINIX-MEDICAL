"use client";

import DoctorShell from "../../components/layout/DoctorShell";
import ReportPanel from "../../components/panels/ReportPanel";
import { useClinic } from "../../hooks/useClinic";

export default function ReportsPage() {
  const { reportPayload } = useClinic();

  return (
    <DoctorShell active="reports">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-slate-400">Analytics</p>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-slate-500">Generate and share patient summaries.</p>
        </div>
      </header>

      <section className="mt-6">
        <ReportPanel report={reportPayload} />
      </section>
    </DoctorShell>
  );
}
