import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PublicLeaderboardPage from "@/pages/public-leaderboard-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeToggle } from "./components/theme-toggle";
// Importación directa sin usar alias @
import CreatorPublicPage from "./pages/creator-public-page";

function App() {
  return (
    <>
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/creator" component={HomePage} />
        <Route path="/public/:token" component={PublicLeaderboardPage} />
        <Route path="/:username" component={CreatorPublicPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;