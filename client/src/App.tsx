import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import VerifyEmailPage from "@/pages/verify-email";
import ResetPasswordPage from "@/pages/reset-password";
import DashboardPage from "@/pages/dashboard";
import NeuralInterfacePage from "@/pages/neural-interface";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import { CookieConsent } from "@/components/cookie-consent";
import { PWAInstallPrompt, OfflineIndicator, UpdateBanner } from "@/components/pwa";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/verify-email" component={VerifyEmailPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/neural-interface" component={NeuralInterfacePage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/" component={Home} />
        </Switch>
        <CookieConsent />
        <PWAInstallPrompt appName="Space Child Dream" />
        <OfflineIndicator />
        <UpdateBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
