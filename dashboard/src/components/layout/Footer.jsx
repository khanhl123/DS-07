export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-alt)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left lg:px-6">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">Marathon Weather Planning Dashboard</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Built for marathon organisers. Evidence-based event planning.</p>
        </div>
        <nav className="flex gap-4 text-xs text-[var(--text-secondary)]" aria-label="Footer links">
          <a href="#methodology" className="hover:text-[var(--text)]">Methodology</a>
          <a href="#" className="hover:text-[var(--text)]">About</a>
          <a href="#" className="hover:text-[var(--text)]">Contact</a>
          <a href="https://github.com/KJLaw2801/DS-07" className="hover:text-[var(--text)]" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
