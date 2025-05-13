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
      {/* Header con controles de usuario */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-background/50 backdrop-blur-sm p-2 rounded-lg border border-border/50">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{user.username}</span>
            </div>
            <div className="w-px h-6 bg-border/50" />
          </>
        )}
        <LanguageToggle />
        <div className="w-px h-6 bg-border/50" />
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