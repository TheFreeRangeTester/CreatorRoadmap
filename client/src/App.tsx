import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import PublicLeaderboardPage from "@/pages/public-leaderboard-page";
import LandingPage from "@/pages/landing-page";
import CreatorQAProfile from "@/pages/creator-qa-profile";
import AuthDebug from "@/pages/auth-debug";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeToggle } from "./components/theme-toggle";
import { LanguageToggle } from "./components/language-toggle";
// Importación directa sin usar alias @
import CreatorPublicPage from "./pages/creator-public-page";

// Páginas de producto
import FeaturesPage from "@/pages/features-page";
import PricingPage from "@/pages/pricing-page";
import DemoPage from "@/pages/demo-page";
import RoadmapPage from "@/pages/roadmap-page";

// Páginas de recursos
import BlogPage from "@/pages/blog-page";
import DocumentationPage from "@/pages/documentation-page";
import GuidesPage from "@/pages/guides-page";
import SuccessPage from "@/pages/success-page";

// Páginas de compañía
import AboutPage from "@/pages/about-page";
import TeamPage from "@/pages/team-page";
import ContactPage from "@/pages/contact-page";
import CareersPage from "@/pages/careers-page";

// Páginas legales
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import CookiesPage from "@/pages/cookies-page";

function App() {
  return (
    <>
      {/* Selector de idioma y tema en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      {/* Espacio para modales */}
      
      {/* Router principal */}
      <Switch>
        <Route path="/" component={LandingPage} />
        <ProtectedRoute path="/dashboard" component={HomePage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/auth-debug" component={AuthDebug} />
        <Route path="/public/:token" component={PublicLeaderboardPage} />
        <Route path="/creators/:username" component={CreatorPublicPage} />
        <Route path="/:username" component={CreatorQAProfile} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;