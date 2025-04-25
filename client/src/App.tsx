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
// Importación directa sin usar alias @
import CreatorPublicPage from "./pages/creator-public-page";

function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/public/:token" component={PublicLeaderboardPage} />
      <Route path="/:username" component={CreatorQAProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;