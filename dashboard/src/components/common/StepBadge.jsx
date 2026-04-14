export default function StepBadge({ variant = "where", children }) {
  const cls =
    variant === "when"
      ? "step-badge step-badge--when"
      : variant === "suitability"
      ? "step-badge step-badge--suit"
      : "step-badge step-badge--where";
  return <span className={cls}>{children}</span>;
}
