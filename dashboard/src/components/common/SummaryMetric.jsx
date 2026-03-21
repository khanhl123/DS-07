export default function SummaryMetric({ icon: Icon, label, value, dark = false }) {
  return (
    <div className={`rounded-lg border p-4 ${dark ? "border-white/10 bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"}`}>
      <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide ${dark ? "text-blue-200" : "text-[var(--text-secondary)]"}`}>
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-bold tracking-tight">{value}</div>
    </div>
  );
}
