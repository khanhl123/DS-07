import { useState } from "react";
import { Activity, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard",    href: "#dashboard",    isHome: true },
  { label: "Map Explorer",  href: "#map-explorer",  isHome: false },
  { label: "Date Analysis", href: "#date-analysis", isHome: false },
  { label: "Comparison",    href: "#comparison",    isHome: false },
  { label: "Methodology",   href: "#methodology",   isHome: false },
];

export default function HeaderBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-[var(--primary)]">Marathon Planner</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--surface-alt)] ${
                item.isHome
                  ? "font-bold text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#map-explorer"
            className="hidden rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-light)] sm:inline-flex"
          >
            Start Planning
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--border)] bg-white px-4 py-3 md:hidden" aria-label="Mobile navigation">
          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  item.isHome ? "font-bold text-[var(--primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#map-explorer"
              className="mt-2 block rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Start Planning
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
