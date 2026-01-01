import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Sparkles, CreditCard } from "lucide-react";

export function UserNav() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = "/api/login"}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        data-testid="button-nav-login"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
          <Avatar className="h-10 w-10 border-2 border-cyan-500/50">
            <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
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
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <Link href="/account">
          <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-cyan-500/20" data-testid="link-account">
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/account?tab=subscription">
          <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-cyan-500/20" data-testid="link-subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/20"
          onClick={() => logout()}
          data-testid="button-menu-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
