export default function Card({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[var(--marathon-line)] border-l-[4px] border-l-[var(--marathon-accent)] bg-[rgba(255,249,243,0.96)] shadow-[0_18px_36px_rgba(56,43,31,0.08)] backdrop-blur-sm ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start gap-3 border-b border-[rgba(217,204,191,0.7)] px-5 py-4">
          {Icon && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(231,111,81,0.12)] text-[var(--marathon-accent)] ring-1 ring-[rgba(231,111,81,0.18)]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6f5b4d]">{title}</h3>
            {subtitle && <p className="mt-1 text-xs leading-5 text-[#8b7769]">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
