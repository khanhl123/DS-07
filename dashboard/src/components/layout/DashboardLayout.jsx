import HeaderBar from "./HeaderBar";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)" }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <HeaderBar />
      <main id="main-content" role="main" aria-label="Dashboard content">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6" style={{ paddingBottom: "120px" }}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
