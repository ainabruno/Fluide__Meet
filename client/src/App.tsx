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
import Subscription from "@/pages/subscription";
import Badges from "@/pages/badges";
import Notifications from "@/pages/notifications";
import GlobalSearch from "@/pages/global-search";
import Courses from "@/pages/courses";
import Mentorship from "@/pages/mentorship";
import Marketplace from "@/pages/marketplace";
import Certifications from "@/pages/certifications";
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
          <Route path="/global-search" component={GlobalSearch} />
          <Route path="/resources" component={Resources} />
          <Route path="/ai" component={AIFeatures} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/community" component={Community} />
          <Route path="/wellness" component={Wellness} />
          <Route path="/courses" component={Courses} />
          <Route path="/mentorship" component={Mentorship} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/certifications" component={Certifications} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/badges" component={Badges} />
          <Route path="/notifications" component={Notifications} />
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
