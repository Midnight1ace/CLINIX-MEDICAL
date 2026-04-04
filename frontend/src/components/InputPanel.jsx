export default function InputPanel({ value, onChange, onAnalyze, onLoadSample, loading }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Input Panel</h2>
          <p className="text-sm text-slate-300">Paste raw patient notes.</p>
        </div>
        <button className="btn-ghost" onClick={onLoadSample} type="button">
          Load Sample
        </button>
      </div>
      <textarea
        className="w-full min-h-[200px] rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste patient notes here..."
      />
      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={onAnalyze} type="button" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <span className="text-xs text-slate-300">Output in seconds</span>
      </div>
    </div>
  );
}
