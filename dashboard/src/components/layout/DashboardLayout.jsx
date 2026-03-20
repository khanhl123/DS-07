import HeaderBar from "./HeaderBar";
import FilterSidebar from "./FilterSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ filterProps, sidebarOpen, onToggleSidebar, children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar {...filterProps} sidebarOpen={sidebarOpen} onCloseSidebar={() => onToggleSidebar(false)} />
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => onToggleSidebar(false)} aria-hidden="true" />
        )}
        <main id="main-content" className="flex-1 overflow-y-auto" role="main" aria-label="Dashboard content">
          <div className="px-4 py-3 lg:hidden">
            <button
              onClick={() => onToggleSidebar(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              aria-label="Open filters panel"
            >
              <Menu className="h-4 w-4" aria-hidden="true" /> Filters
            </button>
          </div>
          <div className="mx-auto max-w-[1200px] space-y-6 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
