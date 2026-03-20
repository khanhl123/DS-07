export default function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
