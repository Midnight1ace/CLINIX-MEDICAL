export default function AlertsPanel({ alerts, threshold, onThresholdChange, liveMode, onLiveToggle }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alerts & Monitoring</h2>
          <p className="text-xs text-slate-400">Critical warnings + filtering</p>
        </div>
        <button className="btn-ghost" type="button" onClick={onLiveToggle}>
          {liveMode ? "Stop Live" : "Start Live"}
        </button>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs text-slate-400">Alert Sensitivity</p>
        <input
          type="range"
          min={1}
          max={6}
          value={threshold}
          onChange={(event) => onThresholdChange(Number(event.target.value))}
          className="mt-2 w-full"
        />
        <p className="mt-2 text-xs text-slate-300">Showing alerts with score >= {threshold}</p>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-slate-400">No alerts above threshold.</p>
        )}
        {alerts.map(({ patient, run }) => (
          <div key={run.id} className="rounded-xl border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-sm font-semibold text-red-200">{patient.name}</p>
            <p className="text-xs text-red-100">
              Risk {run.riskLevel} - Score {run.riskScore}
            </p>
            <p className="text-xs text-slate-200 mt-1">{run.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
