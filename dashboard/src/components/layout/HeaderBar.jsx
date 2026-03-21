import { CloudSun } from "lucide-react";

function RunnerMotif() {
  return (
    <svg viewBox="0 0 220 90" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="runnerStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(244,132,95,0.25)" />
          <stop offset="50%" stopColor="rgba(244,132,95,0.6)" />
          <stop offset="100%" stopColor="rgba(233,196,106,0.34)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#runnerStroke)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 58 H208" strokeDasharray="4 8" />
        <path d="M158 18 V62" />
        <path d="M170 18 V62" />
        <circle cx="110" cy="20" r="8" />
        <path d="M110 30 L98 44 L116 50 L128 38" />
        <path d="M100 44 L84 40" />
        <path d="M116 50 L104 68" />
        <path d="M116 50 L138 64" />
        <path d="M126 36 L144 32" />
      </g>
    </svg>
  );
}

export default function HeaderBar() {
  return (
    <header className="relative overflow-hidden border-b border-[rgba(233,196,106,0.16)] bg-[linear-gradient(120deg,#06111c_0%,var(--marathon-ink)_38%,var(--marathon-ink-soft)_72%,#0a0f18_100%)] px-6 py-5 text-[#fff8ef] shadow-[0_20px_44px_rgba(13,27,42,0.34)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,_rgba(231,111,81,0.24),_transparent_24%),radial-gradient(circle_at_20%_0%,_rgba(233,196,106,0.15),_transparent_20%),linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_56%,transparent_100%)]" />
      <div className="pointer-events-none absolute -right-12 top-0 h-full w-64 bg-[radial-gradient(circle_at_center,_rgba(231,111,81,0.16),_transparent_62%)] blur-2xl" />
      <div className="pointer-events-none absolute right-3 top-1/2 hidden h-24 w-56 -translate-y-1/2 md:block">
        <RunnerMotif />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(231,111,81,0.24),rgba(233,196,106,0.2))] ring-1 ring-[rgba(255,255,255,0.14)] backdrop-blur-sm">
          <CloudSun className="h-5 w-5 text-[var(--marathon-gold)]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--marathon-gold)]">
            Interactive Spatial Visualisation
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.05em] md:text-3xl">
            Marathon Weather Planning Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-light italic tracking-[0.01em] text-[rgba(255,248,239,0.78)]">
            Evidence-based weather analysis for smarter event planning
          </p>
          <div className="mt-3 h-px w-40 bg-gradient-to-r from-[var(--marathon-accent)] via-[var(--marathon-gold)] to-transparent" />
        </div>
      </div>
      <div className="marathon-racing-stripe pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,rgba(231,111,81,0.95)_20%,rgba(233,196,106,0.95)_52%,rgba(42,157,143,0.8)_82%,transparent_100%)]" />
    </header>
  );
}
