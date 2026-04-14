import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const SECTIONS = [
  { id: "where", label: "Explore" },
  { id: "when", label: "Analyse" },
  { id: "suitability", label: "Plan" },
];

export default function HeaderBar() {
  const [active, setActive] = useState("where");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleJump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "var(--primary)", color: "#fff" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius)" }}
          >
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Marathon weather planner</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              Historical weather analysis for marathon planning in Australia
            </div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              Based on Bureau of Meteorology station data — not a weather forecast
            </div>
          </div>
        </div>

        <nav
          className="flex items-center gap-1"
          aria-label="Jump to section"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="nav-pill"
              aria-current={active === s.id ? "location" : undefined}
              onClick={handleJump(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
