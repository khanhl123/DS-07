import HeaderBar from "./HeaderBar";
import Footer from "./Footer";

export default function DashboardLayout({ children, summary, hero }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)" }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <HeaderBar summary={summary} />
      <main
        id="main-content"
        role="main"
        aria-label="Dashboard content"
        style={{ paddingBottom: "120px" }}
      >
        {hero}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
