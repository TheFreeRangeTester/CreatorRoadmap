import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PublicLeaderboardPage from "@/pages/public-leaderboard-page";
import { ProtectedRoute } from "./lib/protected-route";

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/creator" component={HomePage} />
      <Route path="/l/:token" component={PublicLeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
