export default function SummaryMetric({ icon: Icon, label, value, dark = false }) {
  return (
    <div className={`rounded-xl border p-4 ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${dark ? "text-slate-300" : "text-slate-500"}`}>
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-bold tracking-tight">{value}</div>
    </div>
  );
}
