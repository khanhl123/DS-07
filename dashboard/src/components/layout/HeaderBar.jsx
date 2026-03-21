import { Activity } from "lucide-react";

export default function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-[var(--primary)]">Marathon Planner</span>
        </div>

        <a
          href="#map-explorer"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-light)]"
        >
          Start Planning
        </a>
      </div>
    </header>
  );
}
