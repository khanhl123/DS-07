export default function Card({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          {Icon && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
