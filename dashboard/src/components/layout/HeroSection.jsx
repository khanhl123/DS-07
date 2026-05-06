import { ArrowRight, MapPin, LineChart, Target } from "lucide-react";

const STEPS = [
  {
    id: "where",
    number: "01",
    label: "Step 1",
    title: "Where",
    icon: MapPin,
    description:
      "Browse 180 Bureau of Meteorology stations across VIC, NSW, TAS and NT on an interactive map. Filter to find candidate locations that match your race conditions.",
  },
  {
    id: "when",
    number: "02",
    label: "Step 2",
    title: "Analyse",
    icon: LineChart,
    description:
      "Inspect historical patterns month-by-month — maximum and minimum temperature, rainfall and UV index — using charts and KPIs you can adjust.",
  },
  {
    id: "suitability",
    number: "03",
    label: "Step 3",
    title: "Plan",
    icon: Target,
    description:
      "Get an explainable suitability score against your own thresholds, view daily traffic-light calendars, and export the analysis for stakeholders.",
  },
];

export default function HeroSection({ onStart, onJumpTo }) {
  const handleStart = (event) => {
    event.preventDefault();
    onStart?.();
  };

  const handleStep = (id) => (event) => {
    event.preventDefault();
    onJumpTo?.(id);
  };

  return (
    <section
      id="hero"
      className="hero-section"
      aria-labelledby="hero-title"
    >
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <span className="hero-eyebrow">Historical weather analysis · Australia</span>
        <h1 id="hero-title" className="hero-title">
          Plan your marathon with{" "}
          <span className="hero-title-accent">historical weather data</span>.
        </h1>
        <p className="hero-lede">
          Marathon Weather Planner turns decades of Bureau of Meteorology
          observations into a decision-support tool for race organisers.
          Compare locations, inspect trends, and quantify how often a date has
          historically been suitable — all in one workflow.
        </p>

        <div className="hero-cta-row">
          <button
            type="button"
            className="hero-cta"
            onClick={handleStart}
            aria-label="Get started — jump to the map"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hero-cta hero-cta--ghost"
            onClick={handleStep("suitability")}
            aria-label="See how the suitability score works"
          >
            How the score works
          </button>
        </div>

        <ol className="hero-steps" aria-label="How it works">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.id} className="hero-step-card">
                <button
                  type="button"
                  className="hero-step-button"
                  onClick={handleStep(step.id)}
                  aria-label={`Jump to ${step.label}: ${step.title}`}
                >
                  <span className="hero-step-top">
                    <span className="hero-step-number">{step.number}</span>
                    <span className="hero-step-icon" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                  </span>
                  <span className="hero-step-meta">
                    <span className="hero-step-label">{step.label}</span>
                    <span className="hero-step-title">{step.title}</span>
                  </span>
                  <span className="hero-step-desc">{step.description}</span>
                  <span className="hero-step-link">
                    Jump to {step.title.toLowerCase()}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="hero-disclaimer">
          Based on historical Bureau of Meteorology data. This website is meant
          to be a decision-support tool, not a weather forecast.
        </p>
      </div>
    </section>
  );
}
