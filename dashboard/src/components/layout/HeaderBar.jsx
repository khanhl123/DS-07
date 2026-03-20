import { CloudSun } from "lucide-react";

export default function HeaderBar() {
  return (
    <header className="border-b border-slate-200/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
          <CloudSun className="h-5 w-5 text-sky-300" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Interactive Spatial Visualisation
          </p>
          <h1 className="text-lg font-semibold tracking-tight">
            Marathon Weather Planning Dashboard
          </h1>
        </div>
      </div>
    </header>
  );
}
