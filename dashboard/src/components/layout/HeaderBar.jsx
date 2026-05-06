import { useEffect, useState } from "react";
import { Footprints, ArrowRight } from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "where", label: "Explore" },
  { id: "when", label: "Analyse" },
  { id: "suitability", label: "Plan" },
];

const OBSERVED_IDS = SECTIONS.filter((s) => s.id !== "hero").map((s) => s.id);

export default function HeaderBar({ summary }) {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 120) {
        setActive("hero");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    OBSERVED_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToId = (id) => {
    if (id === "hero") {
      scrollToTop();
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJump = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    scrollToTop();
  };

  const hasSelection = !!summary?.hasSelection;

  return (
    <header className="site-header">
      <div className="site-header__row">
        <div className="site-header__brand">
          <button
            type="button"
            onClick={handleBrandClick}
            className="brand-button"
            aria-label="Marathon Weather Planner — back to top"
          >
            <span className="brand-logo" aria-hidden="true">
              <Footprints className="h-5 w-5" />
            </span>
            <span className="brand-text">
              <span className="brand-name">Marathon Weather Planner</span>
              <span className="brand-tagline">Australia · BoM historical data</span>
            </span>
          </button>
        </div>

        <nav className="site-header__nav header-nav" aria-label="Jump to section">
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

        <div className="site-header__cta">
          <button
            type="button"
            onClick={handleJump("where")}
            className="header-cta"
            aria-label="Get started — jump to the map"
          >
            <span className="hidden sm:inline">Get started</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="site-header__strip" role="status" aria-live="polite">
        <div className="site-header__strip-inner">
          <span className="strip-label">Current selection</span>
          {hasSelection ? (
            <>
              <strong className="strip-station">{summary.stationName}</strong>
              <span className="strip-meta">
                #{summary.stationNumber} · {summary.stationState}
              </span>
              <span className="strip-divider" aria-hidden="true">|</span>
              <span className="strip-meta">{summary.timeframe}</span>
              <span className="strip-divider" aria-hidden="true">|</span>
              <span
                className="strip-score"
                style={{ color: summary.scoreColor }}
              >
                {summary.score}/100 · {summary.scoreLabel}
              </span>
            </>
          ) : (
            <span className="strip-empty">
              No current selection — pick a station on the map in Step 1.
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
