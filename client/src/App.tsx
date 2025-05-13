import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import PublicLeaderboardPage from "@/pages/public-leaderboard-page";
import LandingPage from "@/pages/landing-page";
import CreatorQAProfile from "@/pages/creator-qa-profile";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeToggle } from "./components/theme-toggle";
import { LanguageToggle } from "./components/language-toggle";
// Importación directa sin usar alias @
import CreatorPublicPage from "./pages/creator-public-page";

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
        <Route path="/public/:token" component={PublicLeaderboardPage} />
        <Route path="/creators/:username" component={CreatorPublicPage} />
        <Route path="/:username" component={CreatorQAProfile} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;