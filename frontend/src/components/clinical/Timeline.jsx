const trendIcon = {
  up: "^",
  down: "v",
  flat: "-"
};

const levelStyle = {
  low: "text-emerald-200",
  medium: "text-amber-200",
  high: "text-orange-200",
  critical: "text-red-200"
};

export default function Timeline({ history }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-lg font-semibold">Timeline</h2>
      {!history?.length && <p className="text-sm text-slate-400">No history yet.</p>}
      <div className="space-y-3">
        {history?.map((run) => (
          <div key={run.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {new Date(run.createdAt).toLocaleString()}
              </p>
              <span className={`text-xs uppercase tracking-wide ${levelStyle[run.riskLevel]}`}>
                {run.riskLevel} ({run.riskScore})
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{run.summary || "No summary"}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
              <span>
                BP trend {trendIcon[run.trend?.bp || "flat"]}
              </span>
              <span>
                HR trend {trendIcon[run.trend?.hr || "flat"]}
              </span>
              <span>
                Temp trend {trendIcon[run.trend?.temp || "flat"]}
              </span>
            </div>
            {run.anomalies?.length > 0 && (
              <div className="mt-3 text-xs text-red-200">
                {run.anomalies.map((item) => (
                  <p key={item}>ALERT: {item}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
