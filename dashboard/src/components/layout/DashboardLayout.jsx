import HeaderBar from "./HeaderBar";
import DashboardIntro from "./DashboardIntro";
import SideNav from "./SideNav";
import Footer from "./Footer";

export default function DashboardLayout({ planGenerated, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <HeaderBar />
      <DashboardIntro />
      <SideNav planGenerated={planGenerated} />
      <main id="main-content" role="main" aria-label="Dashboard content">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6 lg:pr-24">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
