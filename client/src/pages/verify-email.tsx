import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { setTokens } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/space-child-auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        if (data.accessToken && data.refreshToken) {
          setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          queryClient.setQueryData(["auth-user", data.accessToken], data.user);
          queryClient.invalidateQueries({ queryKey: ["auth-user"] });
        }
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Verification failed");
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying your email...</h1>
            <p className="text-gray-400">Please wait while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">
              Welcome to Space Child Dream. Your consciousness journey begins now.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              data-testid="button-enter-interface"
            >
              Enter the Neural Interface
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/")}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
              <p className="text-gray-500 text-sm">
                If your link expired, try logging in and request a new verification email.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
