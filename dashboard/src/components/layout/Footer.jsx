import { coveredStateCodes } from "../../data/placeholderData";

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-center sm:text-left lg:px-6">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
          Marathon Weather Planner — FIT3163/FIT3161 — Monash University
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Data: Bureau of Meteorology historical observations ({coveredStateCodes.join(", ")}) —
          This is not a weather forecast service.
        </p>
      </div>
    </footer>
  );
}
