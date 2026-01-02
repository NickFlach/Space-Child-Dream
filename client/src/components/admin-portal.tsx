import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  UserX,
  RefreshCw,
  Key,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AdminPortalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPortal({ open, onOpenChange }: AdminPortalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: open && !!accessToken,
  });

  const revokeTokensMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/revoke-tokens`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to revoke tokens");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Tokens revoked", description: "All user sessions have been invalidated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to revoke tokens.", variant: "destructive" });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/space-child-auth/resend-verification", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to resend verification");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Verification sent", description: "Verification email has been resent." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send verification email.", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Admin Management Portal
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/20">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-500/20">
              <Activity className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="apps" className="data-[state=active]:bg-purple-500/20">
              <Key className="w-4 h-4 mr-2" />
              Connected Apps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="flex-1 mt-4">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            <ScrollArea className="h-[calc(80vh-220px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-gray-500 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : "No name"}
                            </span>
                            {user.isEmailVerified ? (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Last login: {formatDate(user.lastLoginAt)}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black/95 border-white/10">
                            <DropdownMenuItem
                              onClick={() => revokeTokensMutation.mutate(user.id)}
                              className="text-yellow-400"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Revoke All Sessions
                            </DropdownMenuItem>
                            {!user.isEmailVerified && (
                              <DropdownMenuItem
                                onClick={() => resendVerificationMutation.mutate(user.email)}
                                className="text-blue-400"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Resend Verification
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-400">
                              <UserX className="w-4 h-4 mr-2" />
                              Disable Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="mt-4 text-xs text-gray-500 text-center">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} total
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <Card className="bg-white/5 border-white/10 p-8 text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Active Sessions</h3>
              <p className="text-gray-500 text-sm">
                Session monitoring coming soon. You can revoke individual user sessions from the Users tab.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="mt-4">
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">SpaceChild IDE</h4>
                    <p className="text-xs text-gray-500">Development</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                </div>
              </Card>
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">SpaceChild Collective</h4>
                    <p className="text-xs text-gray-500">Research</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Pending Setup</Badge>
                </div>
              </Card>
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Angel Informant</h4>
                    <p className="text-xs text-gray-500">Investing</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Pending Setup</Badge>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
