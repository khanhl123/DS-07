import { useEffect, useState } from "react";
import { LayoutDashboard, Map, CalendarDays, Rocket, GitCompareArrows, Lock } from "lucide-react";

const sections = [
  { id: "dashboard",      label: "Dashboard",      icon: LayoutDashboard, locked: false },
  { id: "map-explorer",   label: "Map Explorer",   icon: Map,             locked: false },
  { id: "date-analysis",  label: "Date Analysis",  icon: CalendarDays,    locked: false },
  { id: "start-planning", label: "Start Planning",  icon: Rocket,         locked: false },
  { id: "comparison",     label: "Comparison",      icon: GitCompareArrows, locked: true },
];

export default function SideNav({ planGenerated = false }) {
  const [activeId, setActiveId] = useState("dashboard");

  useEffect(() => {
    const ids = planGenerated ? sections.map((s) => s.id) : sections.filter((s) => !s.locked).map((s) => s.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [planGenerated]);

  const handleClick = (id, isLocked) => {
    if (isLocked && !planGenerated) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-label="Section navigation">
      <div className="rounded-xl border border-[var(--border)] bg-white/90 py-2 shadow-lg backdrop-blur-sm">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeId === s.id;
          const disabled = s.locked && !planGenerated;
          return (
            <button key={s.id} type="button" onClick={() => handleClick(s.id, s.locked)}
              disabled={disabled}
              className={`relative flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors ${
                disabled
                  ? "cursor-not-allowed text-[var(--text-muted)] opacity-50"
                  : isActive
                    ? "font-bold text-[var(--primary)]"
                    : "font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              aria-current={isActive ? "true" : undefined}>
              {isActive && !disabled && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent-blue)]" aria-hidden="true" />}
              {disabled ? (
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[var(--accent-blue)]" : ""}`} aria-hidden="true" />
              )}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
