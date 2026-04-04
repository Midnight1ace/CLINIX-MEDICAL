export default function ExplainabilityModal({ open, onClose, items }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explainability</h2>
          <button className="btn-ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {!items?.length && <p className="text-sm text-slate-300">No explanations yet.</p>}
        <ul className="space-y-3 text-sm text-slate-200">
          {items?.map((item, index) => (
            <li key={`${item}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
