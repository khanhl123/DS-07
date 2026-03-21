export default function SummaryMetric({ icon: Icon, label, value, dark = false }) {
  return (
    <div className={`rounded-xl border p-4 ${dark ? "border-[rgba(233,196,106,0.16)] bg-[rgba(255,255,255,0.06)] text-[#fff9f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" : "border-[var(--marathon-line)] bg-[#fbf5ef] text-[#1f1915]"}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-[var(--marathon-gold)]" : "text-[#8b7260]"}`}>
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-bold tracking-[-0.03em]">{value}</div>
    </div>
  );
}
