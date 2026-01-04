import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, Shield } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { SigilAvatar } from "./biofield/sigil-avatar";
import { useBiofieldProfile } from "@/hooks/use-biofield-profile";

export function UserNav() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { profile } = useBiofieldProfile();

  const handleLogout = () => {
    // Clear session storage to reset splash screen state
    sessionStorage.removeItem("scd_splash_seen");
    logout();
    // Navigate to home (beginning)
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" data-testid="button-user-menu">
          <SigilAvatar 
            seed={profile?.identityCore?.sigilSeed || undefined}
            primaryField={profile?.identityCore?.primaryField as any}
            size={40}
            className="border-2 border-cyan-500/50 rounded-full overflow-hidden"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-900 border-white/10" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white" data-testid="text-menu-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400" data-testid="text-menu-email">
              {user?.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400">Space Child Auth</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <Link href="/dashboard?tab=profile">
          <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-cyan-500/20" data-testid="link-account">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/dashboard?tab=subscription">
          <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-cyan-500/20" data-testid="link-subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/20"
          onClick={handleLogout}
          data-testid="button-menu-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
