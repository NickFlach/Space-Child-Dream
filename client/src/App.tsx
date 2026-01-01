import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import VerifyEmailPage from "@/pages/verify-email";
import ResetPasswordPage from "@/pages/reset-password";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/verify-email" component={VerifyEmailPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/" component={Home} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
