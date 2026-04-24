export default function InsightsPanel({ run, recurring, similarCases }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advanced Insights</h2>
        <span className="text-xs text-slate-400">Patterns + anomalies</span>
      </div>
      {!run && <p className="text-sm text-slate-400">Run analysis to unlock insights.</p>}
      {run && (
        <div className="space-y-4 text-sm text-slate-200">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-slate-400">Predicted Risk</p>
              <p className="mt-1 text-base font-semibold capitalize">{run.predictedRisk}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-slate-400">Confidence Score</p>
              <p className="mt-1 text-base font-semibold">{Math.round(run.confidence * 100)}%</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Rule vs AI Decisions</p>
            <p className="mt-1">
              Rules: {run.ruleCount} - AI: {run.aiCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Highlighted Triggers</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(run.triggers || []).map((trigger) => (
                <span key={trigger} className="chip">
                  {trigger}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Multi-condition Correlation</p>
            {run.correlations?.length ? (
              <ul className="mt-2 space-y-1">
                {run.correlations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-400">No correlations detected.</p>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Recurring Patterns</p>
            {recurring?.length ? (
              <ul className="mt-2 space-y-1">
                {recurring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-400">No recurring risks yet.</p>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-400">Similar Cases</p>
            {similarCases?.length ? (
              <ul className="mt-2 space-y-1">
                {similarCases.map((item) => (
                  <li key={item.patient.id}>
                    {item.patient.name} ({Math.round(item.score * 100)}% match)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-400">No similar cases found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
