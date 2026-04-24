export default function PipelineView({ run }) {
  if (!run) {
    return (
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold">Multi-Agent Reasoning</h2>
        <p className="text-sm text-slate-400">Run an analysis to see pipeline output.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Multi-Agent Reasoning</h2>
        <span className="text-xs text-slate-400">Step-by-step outputs</span>
      </div>
      <div className="space-y-3 text-sm text-slate-200">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Ingestion Agent</p>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(run.structured, null, 2)}</pre>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Clinical Summary Agent</p>
          <p className="mt-2 text-sm">{run.summary}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Risk Detection Agent</p>
          <ul className="mt-2 space-y-1 text-sm">
            {run.risks?.map((risk) => (
              <li key={risk.title}>
                {risk.title} ({risk.level}) - {risk.rationale}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Recommendation Agent</p>
          <ul className="mt-2 space-y-1 text-sm">
            {run.recommendations?.map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Explainability Agent</p>
          <ul className="mt-2 space-y-1 text-sm">
            {run.explainability?.map((exp) => (
              <li key={exp}>{exp}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
