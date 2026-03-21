export default function Card({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4">
          {Icon && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--accent-blue)]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
