import { MapPin, CalendarDays, BarChart3, GitCompareArrows, ShieldCheck, ArrowRight } from "lucide-react";

const steps = [
  { num: 1, emoji: "\ud83d\udccd", icon: MapPin,          label: "Pick a Location",        desc: "Explore the interactive map and choose your marathon city." },
  { num: 2, emoji: "\ud83d\udcc5", icon: CalendarDays,     label: "Choose Your Dates",      desc: "Select a month and time range to evaluate." },
  { num: 3, emoji: "\u26c5",       icon: BarChart3,        label: "Check the Weather",      desc: "Review temperature, humidity, wind, and UV trends." },
  { num: 4, emoji: "\u2696\ufe0f", icon: GitCompareArrows, label: "Compare Locations",      desc: "See how different cities stack up side by side." },
  { num: 5, emoji: "\u2705",       icon: ShieldCheck,      label: "Get Recommendation",     desc: "Receive a suitability score and export your summary." },
];

export default function HowItWorks() {
  return (
    <section id="dashboard" className="border-b border-[var(--border)] bg-[var(--surface-alt)]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--primary)]">How It Works</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Plan your marathon in 5 simple steps</p>
        </div>

        <div className="relative mt-10">
          {/* Connector line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px border-t-2 border-dashed border-[var(--border)] lg:block" aria-hidden="true" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  {/* Step number badge */}
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white shadow-md">
                    {step.num}
                  </div>

                  {/* Card */}
                  <div className="mt-4 w-full rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="text-3xl">{step.emoji}</div>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      <Icon className="h-4 w-4 text-[var(--accent-blue)]" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-[var(--text)]">{step.label}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#map-explorer"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-light)]"
          >
            Start Planning Now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
