import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth, useAuthStore } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  User, Settings, History, CreditCard, Sparkles, Brain, 
  LogOut, ArrowLeft, Zap, Crown, BarChart3
} from "lucide-react";
import { Link } from "wouter";
import { TIER_LIMITS, type SubscriptionTier } from "@shared/schema";

interface ThoughtHistory {
  id: number;
  inputText: string;
  reflection: string;
  resonance: number;
  complexity: number;
  createdAt: string;
}

interface UsageStats {
  dailyProbes: number;
  totalProbes: number;
  tier: SubscriptionTier;
  periodEnd?: string;
}

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const { accessToken } = useAuthStore();
  
  const { data: thoughts = [] } = useQuery<ThoughtHistory[]>({
    queryKey: ["/api/thoughts/history"],
    queryFn: async () => {
      const res = await fetch("/api/thoughts/history", {
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return data.items || data;
    },
    enabled: !!user && !!accessToken,
  });

  const { data: usage } = useQuery<UsageStats>({
    queryKey: ["/api/usage/stats"],
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (tier: "pro" | "enterprise") => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier, returnUrl: window.location.origin }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ returnUrl: window.location.origin + "/account" }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to open portal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Portal Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planName: string) => {
    const tier = planName.toLowerCase() as "pro" | "enterprise";
    if (tier === "pro" || tier === "enterprise") {
      checkoutMutation.mutate(tier);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">
          <Brain className="w-12 h-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-md border-cyan-500/20 bg-slate-900/80 backdrop-blur">
          <CardHeader className="text-center">
            <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <CardTitle className="text-white">Sign In Required</CardTitle>
            <CardDescription>Please sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = (usage?.tier || "free") as SubscriptionTier;
  const limits = TIER_LIMITS[tier];
  const dailyUsagePercent = limits.dailyProbes === Infinity ? 0 : 
    ((usage?.dailyProbes || 0) / limits.dailyProbes) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-2 border-cyan-500/50">
              <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xl">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-400" data-testid="text-user-email">{user.email}</p>
              <Badge 
                className={`mt-2 ${
                  tier === "enterprise" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" :
                  tier === "pro" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" :
                  "bg-gray-500/20 text-gray-400 border-gray-500/50"
                }`}
                data-testid="badge-subscription-tier"
              >
                {tier === "enterprise" && <Crown className="w-3 h-3 mr-1" />}
                {tier === "pro" && <Zap className="w-3 h-3 mr-1" />}
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-800/50 border border-white/10">
              <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-usage">
                <BarChart3 className="w-4 h-4 mr-2" />
                Usage
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-history">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-subscription">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">First Name</label>
                      <p className="text-white font-medium" data-testid="text-profile-firstname">
                        {user.firstName || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Name</label>
                      <p className="text-white font-medium" data-testid="text-profile-lastname">
                        {user.lastName || "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium" data-testid="text-profile-email">
                        {user.email || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      Daily Probes
                    </CardTitle>
                    <CardDescription>
                      {limits.dailyProbes === Infinity ? "Unlimited" : `${usage?.dailyProbes || 0} / ${limits.dailyProbes}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {limits.dailyProbes !== Infinity && (
                      <Progress value={dailyUsagePercent} className="h-2" data-testid="progress-daily-usage" />
                    )}
                    {limits.dailyProbes === Infinity && (
                      <p className="text-cyan-400 text-sm">No limits on your plan</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Total Explorations
                    </CardTitle>
                    <CardDescription>All-time consciousness probes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-white" data-testid="text-total-probes">
                      {usage?.totalProbes || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/50 backdrop-blur md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Plan Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FeatureItem label="History Days" value={limits.historyDays === Infinity ? "∞" : `${limits.historyDays}`} />
                      <FeatureItem label="Export" value={limits.canExport ? "Yes" : "No"} enabled={limits.canExport} />
                      <FeatureItem label="Sharing" value={limits.canShare ? "Yes" : "No"} enabled={limits.canShare} />
                      <FeatureItem label="Prompt Evolution" value={limits.promptEvolution ? "Yes" : "No"} enabled={limits.promptEvolution} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Thought History</CardTitle>
                  <CardDescription>Your recent consciousness explorations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {thoughts.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No explorations yet</p>
                        <Link href="/">
                          <Button variant="link" className="text-cyan-400" data-testid="link-start-exploring">
                            Start exploring
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {thoughts.map((thought) => (
                          <div 
                            key={thought.id} 
                            className="p-4 rounded-lg bg-slate-800/50 border border-white/5"
                            data-testid={`card-thought-${thought.id}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-white font-medium line-clamp-1">{thought.inputText}</p>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                                  {thought.resonance}%
                                </Badge>
                                <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                                  {thought.complexity}%
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">{thought.reflection}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(thought.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <PlanCard 
                  name="Free"
                  price="$0"
                  current={tier === "free"}
                  features={["10 daily probes", "7 days history", "Basic sharing"]}
                  onUpgrade={handleUpgrade}
                  isLoading={checkoutMutation.isPending}
                />
                <PlanCard 
                  name="Pro"
                  price="$9"
                  current={tier === "pro"}
                  featured
                  features={["100 daily probes", "90 days history", "Export data", "Prompt evolution"]}
                  onUpgrade={handleUpgrade}
                  isLoading={checkoutMutation.isPending}
                />
                <PlanCard 
                  name="Enterprise"
                  price="$29"
                  current={tier === "enterprise"}
                  features={["Unlimited probes", "Unlimited history", "API access", "Custom prompts"]}
                  onUpgrade={handleUpgrade}
                  isLoading={checkoutMutation.isPending}
                />
              </div>
              {tier !== "free" && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                    className="border-gray-600 text-gray-400"
                    data-testid="button-manage-subscription"
                  >
                    {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ label, value, enabled = true }: { label: string; value: string; enabled?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${enabled ? "bg-cyan-500/10" : "bg-slate-800/50"}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${enabled ? "text-cyan-400" : "text-gray-500"}`}>{value}</p>
    </div>
  );
}

function PlanCard({ 
  name, 
  price, 
  features, 
  current, 
  featured,
  onUpgrade,
  isLoading
}: { 
  name: string; 
  price: string; 
  features: string[]; 
  current?: boolean;
  featured?: boolean;
  onUpgrade?: (planName: string) => void;
  isLoading?: boolean;
}) {
  return (
    <Card 
      className={`border-white/10 bg-slate-900/50 backdrop-blur relative ${
        featured ? "border-purple-500/50 shadow-lg shadow-purple-500/20" : ""
      } ${current ? "ring-2 ring-cyan-500" : ""}`}
      data-testid={`card-plan-${name.toLowerCase()}`}
    >
      {featured && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
          Most Popular
        </Badge>
      )}
      {current && (
        <Badge className="absolute -top-3 right-4 bg-cyan-500">
          Current
        </Badge>
      )}
      <CardHeader className="text-center pt-8">
        <CardTitle className="text-white">{name}</CardTitle>
        <p className="text-3xl font-bold text-white mt-2">
          {price}<span className="text-sm text-gray-400">/mo</span>
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full ${
            current ? "bg-gray-700 cursor-not-allowed" : 
            name === "Free" ? "bg-slate-700 cursor-not-allowed" :
            featured ? "bg-gradient-to-r from-purple-500 to-pink-500" :
            "bg-slate-700 hover:bg-slate-600"
          }`}
          disabled={current || name === "Free" || isLoading}
          onClick={() => onUpgrade?.(name)}
          data-testid={`button-select-${name.toLowerCase()}`}
        >
          {current ? "Current Plan" : name === "Free" ? "Free Forever" : isLoading ? "Loading..." : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}
