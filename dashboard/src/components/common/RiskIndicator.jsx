import { suitabilityConfig } from "../../data/placeholderData";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const icons = {
  suitable: CheckCircle2,
  slightly_suitable: AlertTriangle,
  not_suitable: XCircle,
};

export default function RiskIndicator({ suitability, showLabel = true, size = "md" }) {
  const cfg = suitabilityConfig[suitability] || suitabilityConfig.slightly_suitable;
  const Icon = icons[suitability] || AlertTriangle;
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[0_10px_18px_rgba(61,46,33,0.08)] ${cfg.chipBg} ${cfg.chipBorder} ${cfg.textColor}`}>
      <Icon className={sizeClass} aria-hidden="true" />
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
}
