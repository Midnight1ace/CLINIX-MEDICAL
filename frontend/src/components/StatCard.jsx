export default function StatCard({ label, value, helper }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}
