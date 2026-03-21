import HeaderBar from "./HeaderBar";
import FilterSidebar from "./FilterSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ filterProps, sidebarOpen, onToggleSidebar, children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#f7f0e8_0%,#ecdfd2_100%)]">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar {...filterProps} sidebarOpen={sidebarOpen} onCloseSidebar={() => onToggleSidebar(false)} />
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-[rgba(13,27,42,0.5)] backdrop-blur-[1px] lg:hidden" onClick={() => onToggleSidebar(false)} aria-hidden="true" />
        )}
        <main
          id="main-content"
          className="marathon-surface-texture relative flex-1 overflow-y-auto"
          role="main"
          aria-label="Dashboard content"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" aria-hidden="true" />
          <div className="relative z-10 px-4 py-3 lg:hidden">
            <button
              onClick={() => onToggleSidebar(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--marathon-line)] bg-[var(--marathon-paper)] px-3 py-2 text-sm font-semibold text-[#46382d] shadow-[0_10px_24px_rgba(61,46,33,0.08)] transition hover:bg-[#fff4ea]"
              aria-label="Open filters panel"
            >
              <Menu className="h-4 w-4 text-[var(--marathon-accent)]" aria-hidden="true" /> Filters
            </button>
          </div>
          <div className="relative z-10 mx-auto max-w-[1200px] space-y-6 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
