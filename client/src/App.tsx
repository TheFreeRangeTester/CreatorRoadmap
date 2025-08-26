import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import PublicLeaderboardPage from "@/pages/public-leaderboard-page";
import LandingPage from "@/pages/landing-page";
import AuthDebug from "@/pages/auth-debug";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeToggle } from "./components/theme-toggle";
import { LanguageToggle } from "./components/language-toggle";
// Importación directa sin usar alias @
import CreatorProfileUnified from "./pages/creator-profile-unified";
import ModernPublicProfile from "@/pages/modern-public-profile";

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

// Página de recuperación de contraseña
import ForgotPasswordPage from "@/pages/forgot-password-page";

// Páginas de suscripción
import SubscriptionPage from "@/pages/subscription-page";
import SubscriptionSuccessPage from "@/pages/subscription-success-page";
import SubscriptionCancelPage from "@/pages/subscription-cancel-page";
import DashboardSettingsPage from "@/pages/dashboard-settings-page";

// Páginas de flujo de pago de testing
import PaymentSuccessPage from "@/pages/payment-success-page";
import PaymentCancelPage from "@/pages/payment-cancel-page";
import PaymentFailurePage from "@/pages/payment-failure-page";

function App() {
  return (
    <>
      {/* Selector de idioma y tema en la esquina superior derecha */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 items-center space-x-2 md:space-x-3 lg:space-x-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Espacio para modales */}

      {/* Router principal */}
      <Switch>
        <Route path="/" component={LandingPage} />
        <ProtectedRoute path="/dashboard" component={HomePage} />
        <ProtectedRoute path="/dashboard/settings" component={DashboardSettingsPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/auth-debug" component={AuthDebug} />
        <Route path="/public/:token" component={PublicLeaderboardPage} />
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

        {/* Ruta de recuperación de contraseña */}
        <Route path="/forgot-password" component={ForgotPasswordPage} />

        {/* Rutas de suscripción */}
        <ProtectedRoute path="/subscription" component={SubscriptionPage} />
        <Route
          path="/subscription/success"
          component={SubscriptionSuccessPage}
        />
        <Route path="/subscription/cancel" component={SubscriptionCancelPage} />

        {/* Rutas de testing de pagos (solo desarrollo) */}
        <Route path="/payment/success" component={PaymentSuccessPage} />
        <Route path="/payment/cancel" component={PaymentCancelPage} />
        <Route path="/payment/failure" component={PaymentFailurePage} />

        {/* Rutas unificadas del creador */}
        <Route path="/creators/:username" component={ModernPublicProfile} />
        <Route path="/:username" component={ModernPublicProfile} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;
