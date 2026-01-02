import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import { Spinner } from "@/components/ui/spinner";

const Home = lazy(() => import("@/pages/home"));
const VerifyEmailPage = lazy(() => import("@/pages/verify-email"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const NeuralInterfacePage = lazy(() => import("@/pages/neural-interface"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const TermsPage = lazy(() => import("@/pages/terms"));

const CookieConsent = lazy(() => import("@/components/cookie-consent").then(m => ({ default: m.CookieConsent })));
const PWAInstallPrompt = lazy(() => import("@/components/pwa").then(m => ({ default: m.PWAInstallPrompt })));
const OfflineIndicator = lazy(() => import("@/components/pwa").then(m => ({ default: m.OfflineIndicator })));
const UpdateBanner = lazy(() => import("@/components/pwa").then(m => ({ default: m.UpdateBanner })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Spinner className="w-12 h-12 text-cyan-500" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/verify-email" component={VerifyEmailPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/neural-interface" component={NeuralInterfacePage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/" component={Home} />
          </Switch>
        </Suspense>
        <Suspense fallback={null}>
          <CookieConsent />
          <PWAInstallPrompt appName="Space Child Dream" />
          <OfflineIndicator />
          <UpdateBanner />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
