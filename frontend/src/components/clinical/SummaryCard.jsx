export default function SummaryCard({ summary, structured, steps }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clinical Summary</h2>
        <div className="flex flex-wrap gap-2">
          {steps?.map((step) => (
            <span key={step} className="chip">
              {step}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-200">{summary || "No summary yet."}</p>
      {structured && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-200">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(structured, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
