export default function ReportPanel({ report }) {
  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clinix-report-${report.patient.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    if (!report) return;
    const text = `${report.patient.name} - ${report.latestRun.summary}`;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Report & Share</h2>
        <span className="text-xs text-slate-400">Export + summary</span>
      </div>
      {!report && <p className="text-sm text-slate-400">Run analysis to generate report.</p>}
      {report && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
            <p className="font-semibold">{report.patient.name}</p>
            <p className="text-xs text-slate-400">
              Priority {report.patient.priority} - Status {report.patient.status}
            </p>
            <p className="mt-2 text-sm">{report.latestRun.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="button" onClick={downloadReport}>
              Download Report
            </button>
            <button className="btn-ghost" type="button" onClick={copySummary}>
              Copy Summary
            </button>
            <button className="btn-ghost" type="button" onClick={() => window.print()}>
              Print View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
