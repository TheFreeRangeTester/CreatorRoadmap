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
        
        {/* Rutas de producto */}
        <Route path="/features" component={FeaturesPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/demo" component={DemoPage} />
        <Route path="/roadmap" component={RoadmapPage} />
        
        {/* Rutas de recursos */}
        <Route path="/blog" component={BlogPage} />
        <Route path="/documentation" component={DocumentationPage} />
        <Route path="/guides" component={GuidesPage} />
        <Route path="/success-stories" component={SuccessPage} />
        
        {/* Rutas de compañía */}
        <Route path="/about" component={AboutPage} />
        <Route path="/team" component={TeamPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/careers" component={CareersPage} />
        
        {/* Rutas legales */}
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/cookies" component={CookiesPage} />
        
        {/* Ruta del creador debe ir al final para evitar conflictos con otras rutas */}
        <Route path="/:username" component={CreatorQAProfile} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;