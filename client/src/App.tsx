import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import Resources from "@/pages/resources";
import AIFeatures from "@/pages/ai-features";
import Professionals from "@/pages/professionals";
import Community from "@/pages/community";
import Wellness from "@/pages/wellness";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/events" component={Events} />
          <Route path="/messages" component={Messages} />
          <Route path="/search" component={Search} />
          <Route path="/resources" component={Resources} />
          <Route path="/ai" component={AIFeatures} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/community" component={Community} />
          <Route path="/wellness" component={Wellness} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
