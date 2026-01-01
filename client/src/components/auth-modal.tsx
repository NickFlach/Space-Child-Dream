import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Shield, Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      await register({ email, password, firstName, lastName });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError(null);
  };

  const isLoading = isLoggingIn || isRegistering;
  const displayError = error || loginError || registerError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-cyan-400" />
            Space Child Auth
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Secure authentication powered by zero-knowledge proofs
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); setError(null); }}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-login">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-register">
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="consciousness@spacechild.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white"
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white"
                  required
                  data-testid="input-login-password"
                />
              </div>
              {displayError && (
                <p className="text-red-400 text-sm" data-testid="text-auth-error">{displayError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="register-firstName"
                    type="text"
                    placeholder="Space"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white"
                    data-testid="input-register-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="register-lastName"
                    type="text"
                    placeholder="Child"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white"
                    data-testid="input-register-lastName"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="consciousness@spacechild.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white"
                  required
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white"
                  required
                  minLength={8}
                  data-testid="input-register-password"
                />
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>
              {displayError && (
                <p className="text-red-400 text-sm" data-testid="text-auth-error">{displayError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                disabled={isLoading}
                data-testid="button-register-submit"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            <br />
            <span className="text-cyan-400">Powered by Space Child Auth with ZKP</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
