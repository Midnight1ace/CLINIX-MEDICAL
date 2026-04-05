const levelStyles = {
  high: "border-red-400/40 bg-red-500/15 text-red-200",
  medium: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  low: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
};

export default function RiskAlerts({ risks }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Risk Alerts</h2>
      {!risks?.length && <p className="text-sm text-slate-300">No risks detected.</p>}
      <div className="space-y-3">
        {risks?.map((risk, index) => (
          <div
            key={`${risk.title}-${index}`}
            className={`rounded-xl border px-4 py-3 text-sm ${levelStyles[risk.level] || levelStyles.low}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{risk.title}</span>
              <span className="text-xs uppercase tracking-wide">
                {risk.level} {risk.source ? `(${risk.source})` : ""}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-90">{risk.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
