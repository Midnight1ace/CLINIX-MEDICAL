export default function Recommendations({ recommendations }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Recommendations</h2>
      {!recommendations?.length && (
        <p className="text-sm text-slate-300">No recommendations yet.</p>
      )}
      <ul className="space-y-2 text-sm text-slate-200">
        {recommendations?.map((rec, index) => (
          <li key={`${rec}-${index}`} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
