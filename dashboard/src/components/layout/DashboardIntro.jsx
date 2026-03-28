import { MapPin, CalendarDays, BarChart3, GitCompareArrows, ShieldCheck, ArrowRight, Thermometer, Droplets, Wind, Sun } from "lucide-react";

const steps = [
  { emoji: "\ud83d\udccd", icon: MapPin,          label: "Pick a Location",    desc: "Explore the interactive map and choose your marathon city." },
  { emoji: "\ud83d\udcc5", icon: CalendarDays,     label: "Choose Your Dates",  desc: "Select a month and time range to evaluate." },
  { emoji: "\u26c5",       icon: BarChart3,        label: "Check the Weather",  desc: "Review temperature, humidity, wind, and UV trends." },
  { emoji: "\u2696\ufe0f", icon: GitCompareArrows, label: "Compare Options",    desc: "See how different cities stack up side by side." },
  { emoji: "\u2705",       icon: ShieldCheck,      label: "Get Your Score",     desc: "Receive a suitability score and export your summary." },
];

const factors = [
  { icon: Thermometer, label: "Temperature", detail: "Optimal 10\u201320\u00b0C. Penalised above 25\u00b0C.", color: "text-red-500" },
  { icon: Droplets,    label: "Humidity",     detail: "Penalised above 60%. Impairs thermoregulation.",        color: "text-blue-500" },
  { icon: Wind,        label: "Wind Speed",   detail: "Above 15 km/h reduces scores. 30+ is high risk.",      color: "text-teal-500" },
  { icon: Sun,         label: "UV Index",     detail: "Above 6 is penalised. 8+ is dangerous for events.",    color: "text-orange-500" },
];

export default function DashboardIntro() {
  return (
    <section id="dashboard" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        {/* Hero headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)] lg:text-4xl">
            Plan Your Marathon with Confidence
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
            Analyse weather patterns across Australia. Compare locations, evaluate
            date suitability, and make data-driven decisions for your next marathon event.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["8 Cities", "4 Weather Metrics", "Daily to Annual Views"].map((stat) => (
              <span key={stat} className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {stat}
              </span>
            ))}
          </div>
          <a
            href="#map-explorer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-light)]"
          >
            Start Planning
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* How it works steps */}
        <div className="mt-16">
          <h2 className="text-center text-lg font-bold text-[var(--primary)]">How It Works</h2>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">5 simple steps to plan your event</p>

          <div className="relative mt-8">
            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex h-full min-h-0 flex-col items-center text-center">
                    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shadow">{i + 1}</div>
                    <div className="mt-3 flex h-full min-h-[7.5rem] w-full flex-1 flex-col rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm transition hover:shadow-md">
                      <div className="text-xl">{step.emoji}</div>
                      <div className="mt-1 flex items-center justify-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--accent-blue)]" aria-hidden="true" />
                        <h3 className="text-xs font-bold text-[var(--text)]">{step.label}</h3>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Methodology summary */}
        <div className="mt-16 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6">
          <h2 className="text-sm font-bold text-[var(--primary)]">How We Score Suitability</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            The suitability score is a weighted composite index based on four weather attributes
            that directly affect runner safety and event quality.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {factors.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-white p-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${f.color}`} aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">{f.label}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{f.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border-l-4 border-l-[var(--accent-blue)] bg-blue-50 px-4 py-3">
            <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
              <strong className="text-green-700">Suitable</strong> (70+) &middot;
              <strong className="text-amber-700"> Slightly Suitable</strong> (45\u201369) &middot;
              <strong className="text-red-700"> Not Suitable</strong> (below 45)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
