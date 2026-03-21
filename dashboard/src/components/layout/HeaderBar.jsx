import { CloudSun } from "lucide-react";

function RunnerMotif() {
  return (
    <svg viewBox="0 0 220 90" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="runnerStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(244,132,95,0.15)" />
          <stop offset="50%" stopColor="rgba(244,132,95,0.45)" />
          <stop offset="100%" stopColor="rgba(233,196,106,0.2)" />
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
    <header className="relative overflow-hidden border-b border-[rgba(233,196,106,0.16)] bg-[linear-gradient(118deg,var(--marathon-ink)_0%,var(--marathon-ink-soft)_56%,#572b24_100%)] px-6 py-4 text-[#fff8ef] shadow-[0_20px_44px_rgba(13,27,42,0.3)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(244,132,95,0.2),_transparent_34%),radial-gradient(circle_at_20%_0%,_rgba(233,196,106,0.14),_transparent_20%)]" />
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
          <h1 className="mt-1 text-xl font-extrabold tracking-[-0.03em] md:text-2xl">
            Marathon Weather Planning Dashboard
          </h1>
          <div className="mt-2 h-px w-24 bg-gradient-to-r from-[var(--marathon-accent)] via-[var(--marathon-gold)] to-transparent" />
        </div>
      </div>
    </header>
  );
}
