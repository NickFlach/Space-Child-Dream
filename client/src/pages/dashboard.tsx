import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { UserNav } from "@/components/user-nav";
import { GlitchText } from "@/components/glitch-text";
import { ImmersiveBackground } from "@/components/immersive-background";
import {
  Palette,
  FlaskConical,
  Shirt,
  GraduationCap,
  TrendingUp,
  Code,
  Sparkles,
  ExternalLink,
  Settings,
  User,
  CreditCard,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

interface AppInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  status: "active" | "coming_soon" | "beta";
  icon?: React.ReactNode;
}

interface CategoryInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  apps: AppInfo[];
}

const APP_CATEGORIES: CategoryInfo[] = [
  {
    id: "art",
    name: "Art",
    icon: <Palette className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500",
    apps: [
      {
        id: "spacechild-waitlist",
        name: "SpaceChild Waitlist",
        description: "AI-powered art generation and creative exploration",
        url: "https://vibe.spacechild.love",
        status: "coming_soon",
      },
    ],
  },
  {
    id: "research",
    name: "Research",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500",
    apps: [
      {
        id: "spacechild-collective",
        name: "SpaceChild Collective",
        description: "Collaborative research platform for consciousness studies",
        url: "https://research.spacechild.love",
        status: "active",
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: <Shirt className="w-5 h-5" />,
    color: "from-purple-500 to-fuchsia-500",
    apps: [
      {
        id: "flaukowski-fashion",
        name: "Flaukowski Fashion",
        description: "AI-curated fashion recommendations and style analysis",
        url: "https://fashion.spacechild.love",
        status: "active",
      },
    ],
  },
  {
    id: "learning",
    name: "Learning",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    apps: [
      {
        id: "space-child-learn",
        name: "Space Child Learn",
        description: "Interactive learning platform with AI tutoring",
        url: "https://u.spacechild.love",
        status: "active",
      },
    ],
  },
  {
    id: "investing",
    name: "Investing",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-yellow-500 to-orange-500",
    apps: [
      {
        id: "angel-informant",
        name: "Angel Informant",
        description: "AI-powered investment opportunity discovery",
        url: "https://angel.spacechild.love",
        status: "active",
      },
    ],
  },
  {
    id: "development",
    name: "Development",
    icon: <Code className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    apps: [
      {
        id: "ninja-craft-hub",
        name: "Ninja Craft Hub",
        description: "AI-assisted development and project management",
        url: "https://stealth.spacechild.love",
        status: "active",
      },
      {
        id: "spacechild",
        name: "SpaceChild IDE",
        description: "Intelligent development environment with AI assistance",
        url: "https://ide.spacechild.love",
        status: "active",
      },
    ],
  },
  {
    id: "experimental",
    name: "Experimental",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-violet-500 to-purple-500",
    apps: [
      {
        id: "cosmic-empathy-core",
        name: "Cosmic Empathy Core",
        description: "Experimental consciousness exploration interface",
        url: "https://heart.spacechild.love",
        status: "beta",
      },
      {
        id: "flaukowski-mind",
        name: "Flaukowski Mind",
        description: "Advanced neural pattern analysis experiments",
        url: "https://flaukowski.spacechild.love",
        status: "beta",
      },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const searchString = useSearch();
  const [activeTab, setActiveTab] = useState("apps");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tab = params.get("tab");
    if (tab && ["apps", "profile", "subscription", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchString]);

  const selectedCategoryData = selectedCategory
    ? APP_CATEGORIES.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <ImmersiveBackground imageSrc={generatedImage} />

      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-display font-bold text-lg tracking-tight">SCD</span>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
            Dashboard
          </Badge>
        </div>
        <UserNav />
      </header>

      <main className="relative z-10 pt-20 pb-12 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
              <GlitchText text="COMMAND CENTER" />
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Welcome back, {user?.firstName || "Explorer"}. Access your Space Child ecosystem.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="apps" className="data-[state=active]:bg-cyan-500/20">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Apps
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-cyan-500/20">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-6">
              <AnimatePresence mode="wait">
                {selectedCategory ? (
                  <motion.div
                    key="category-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedCategory(null)}
                      className="mb-4 text-gray-400 hover:text-white"
                    >
                      ← Back to Categories
                    </Button>
                    
                    {selectedCategoryData && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${selectedCategoryData.color}`}>
                            {selectedCategoryData.icon}
                          </div>
                          <div>
                            <h2 className="text-2xl font-display font-bold text-white">
                              {selectedCategoryData.name}
                            </h2>
                            <p className="text-gray-400 text-sm">
                              {selectedCategoryData.apps.length} app{selectedCategoryData.apps.length !== 1 ? "s" : ""} available
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCategoryData.apps.map((app, idx) => (
                            <motion.div
                              key={app.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <Card className="glass border-white/10 p-6 hover:border-cyan-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-lg font-display font-bold text-white">
                                    {app.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={
                                      app.status === "active"
                                        ? "border-green-500/50 text-green-400"
                                        : app.status === "beta"
                                        ? "border-yellow-500/50 text-yellow-400"
                                        : "border-gray-500/50 text-gray-400"
                                    }
                                  >
                                    {app.status === "coming_soon" ? "Coming Soon" : app.status}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{app.description}</p>
                                <Button
                                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                                  disabled={app.status === "coming_soon"}
                                  onClick={() => window.open(app.url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {app.status === "coming_soon" ? "Coming Soon" : "Launch App"}
                                </Button>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {APP_CATEGORIES.map((category, idx) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          className="glass border-white/10 p-6 cursor-pointer hover:border-cyan-500/50 transition-all group"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} group-hover:scale-110 transition-transform`}>
                              {category.icon}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          <h3 className="text-lg font-display font-bold text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">
                            {category.apps.length} app{category.apps.length !== 1 ? "s" : ""}
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="glass border-white/10 p-8">
                <h2 className="text-xl font-display font-bold text-white mb-6">Profile Management</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-mono uppercase">First Name</label>
                      <p className="text-white">{user?.firstName || "—"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono uppercase">Last Name</label>
                      <p className="text-white">{user?.lastName || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 font-mono uppercase">Email</label>
                      <p className="text-white">{user?.email || "—"}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                    Edit Profile
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="glass border-white/10 p-8">
                <h2 className="text-xl font-display font-bold text-white mb-6">Subscription Management</h2>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">Current Plan</h3>
                        <p className="text-gray-400 text-sm">All Apps Access (Beta)</p>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Active</Badge>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    During beta, you have access to all apps in the Space Child ecosystem. 
                    Individual app subscriptions will be available soon.
                  </p>
                  <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                    Manage Billing
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="glass border-white/10 p-8">
                <h2 className="text-xl font-display font-bold text-white mb-6">Dashboard Settings</h2>
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Customize your dashboard experience and notification preferences.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white">Dark Mode</span>
                      <Badge className="bg-green-500/20 text-green-400">Always On</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white">Email Notifications</span>
                      <Button variant="ghost" size="sm" className="text-cyan-400">Configure</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
