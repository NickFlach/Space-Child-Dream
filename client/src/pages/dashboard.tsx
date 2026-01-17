import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { UserNav } from "@/components/user-nav";
import { GlitchText } from "@/components/glitch-text";
import { ImmersiveBackground } from "@/components/immersive-background";
import { BioFieldProfilePage } from "@/components/biofield";
import {
  ExternalLink,
  Settings,
  CreditCard,
  LayoutDashboard,
  ChevronRight,
  Fingerprint,
  Bell,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ArtSigil,
  ResearchSigil,
  FashionSigil,
  LearningSigil,
  InvestingSigil,
  DevelopmentSigil,
  Web3Sigil,
  ExperimentalSigil,
  HardwareSigil,
} from "@/components/space-child-sigils";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

interface AppInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  status: "active" | "coming_soon" | "beta";
  icon?: React.ReactNode;
  ogImage?: string;
  favicon?: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  heroPattern: string;
  apps: AppInfo[];
}

const APP_CATEGORIES: CategoryInfo[] = [
  {
    id: "art",
    name: "Art & Music",
    icon: <ArtSigil className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500",
    description: "Where consciousness meets canvas and sound. Create, explore, and express through AI-powered artistic and musical experiences.",
    heroPattern: "radial-gradient(ellipse at 30% 20%, rgba(236,72,153,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(244,63,94,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(244,63,94,0.1) 100%)",
    apps: [
      {
        id: "vibe-singularity",
        name: "Vibe Singularity",
        description: "AI-powered mood detection and creative vibe exploration. Transform your emotional state into personalized artistic experiences.",
        url: "https://vibe.spacechild.love",
        status: "active",
        ogImage: "https://vibe.spacechild.love/og-image.png",
        favicon: "https://vibe.spacechild.love/favicon.png",
      },
      {
        id: "audionoise",
        name: "Audio Noise",
        description: "Immersive soundscapes and generative audio experiences. Explore cosmic frequencies and AI-crafted sonic landscapes.",
        url: "https://audionoise.spacechild.love",
        status: "active",
        ogImage: "https://audionoise.spacechild.love/og-image.png",
        favicon: "https://audionoise.spacechild.love/favicon.png",
      },
    ],
  },
  {
    id: "research",
    name: "Research",
    icon: <ResearchSigil className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500",
    description: "Pioneer the frontiers of knowledge. Collaborate on consciousness studies with blockchain-verified research.",
    heroPattern: "radial-gradient(ellipse at 20% 30%, rgba(6,182,212,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)",
    apps: [
      {
        id: "spacechild-collective",
        name: "SpaceChild Collective",
        description: "Revolutionary research collaboration platform merging human insight with AI consciousness. Blockchain-secured papers with ZK-proof authentication.",
        url: "https://research.spacechild.love",
        status: "active",
        ogImage: "https://research.spacechild.love/api/seo/og-image?platform=spacechildcollective&format=png",
        favicon: "https://research.spacechild.love/favicon.svg",
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: <FashionSigil className="w-5 h-5" />,
    color: "from-purple-500 to-fuchsia-500",
    description: "Style meets the stars. Discover post-mythic footwear and cosmic fashion from the outer rim.",
    heroPattern: "radial-gradient(ellipse at 40% 20%, rgba(168,85,247,0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(217,70,239,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(217,70,239,0.1) 100%)",
    apps: [
      {
        id: "flaukowski-fashion",
        name: "Flaukowski Fashion",
        description: "Post-mythic footwear and cosmic fashion. AI-curated style recommendations for the conscious explorer. Your feet deserve cosmic drip.",
        url: "https://fashion.spacechild.love",
        status: "active",
        ogImage: "https://fashion.spacechild.love/space-child-og.png",
        favicon: "https://fashion.spacechild.love/favicon.png",
      },
    ],
  },
  {
    id: "learning",
    name: "Learning",
    icon: <LearningSigil className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    description: "Education born in zero gravity. Master AI, automation, and conscious technology for a wiser tomorrow.",
    heroPattern: "radial-gradient(ellipse at 25% 25%, rgba(34,197,94,0.3) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(16,185,129,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.1) 100%)",
    apps: [
      {
        id: "space-child-learn",
        name: "Space Child University",
        description: "The first university born in zero gravity. A visionary digital academy teaching humanity to wisely utilize AI and advanced technology.",
        url: "https://u.spacechild.love",
        status: "active",
        ogImage: "https://u.spacechild.love/og-image.png",
        favicon: "https://storage.googleapis.com/gpt-engineer-file-uploads/cgPHicSyHnSXswBceoWqLGlmwgP2/uploads/1767338284023-gold_red_rose_heart_favicon.png",
      },
    ],
  },
  {
    id: "investing",
    name: "Investing",
    icon: <InvestingSigil className="w-5 h-5" />,
    color: "from-yellow-500 to-orange-500",
    description: "Angels among algorithms. Discover early-stage opportunities with AI-powered investment intelligence.",
    heroPattern: "radial-gradient(ellipse at 30% 30%, rgba(234,179,8,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(249,115,22,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(249,115,22,0.1) 100%)",
    apps: [
      {
        id: "angel-informant",
        name: "Angel Informant",
        description: "Empowering non-technical investors with technology insights, exclusive startup opportunities, and intelligent tracking tools.",
        url: "https://angel.spacechild.love",
        status: "active",
        ogImage: "https://angel.spacechild.love/og-image.png",
        favicon: "https://angel.spacechild.love/favicon.ico",
      },
    ],
  },
  {
    id: "development",
    name: "Development",
    icon: <DevelopmentSigil className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    description: "Build in stealth, launch with impact. AI-powered development tools for the conscious creator.",
    heroPattern: "radial-gradient(ellipse at 20% 40%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(99,102,241,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)",
    apps: [
      {
        id: "ninja-craft-hub",
        name: "Ninja Craft Hub",
        description: "The ultimate consciousness-verified multi-agent AI platform. Build apps with AI agents, launch with complete anonymity, monetize your creations.",
        url: "https://stealth.spacechild.love",
        status: "active",
        ogImage: "https://storage.googleapis.com/gpt-engineer-file-uploads/cgPHicSyHnSXswBceoWqLGlmwgP2/social-images/social-1760564540787-SpaceChildOctopus.png",
        favicon: "https://storage.googleapis.com/gpt-engineer-file-uploads/cgPHicSyHnSXswBceoWqLGlmwgP2/uploads/1760564506942-SpaceChildOctopus.png",
      },
      {
        id: "spacechild",
        name: "SpaceChild IDE",
        description: "Intelligent development environment with AI assistance. Build applications with consciousness and superintelligence capabilities.",
        url: "https://ide.spacechild.love",
        status: "active",
        ogImage: "https://ide.spacechild.love/og-image.png",
        favicon: "https://ide.spacechild.love/favicon.svg",
      },
    ],
  },
  {
    id: "web3",
    name: "Web3",
    icon: <Web3Sigil className="w-5 h-5" />,
    color: "from-amber-500 to-yellow-500",
    description: "Decentralized futures built on blockchain. Smart contracts, tokenization, and the next evolution of the internet.",
    heroPattern: "radial-gradient(ellipse at 30% 30%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(234,179,8,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(234,179,8,0.1) 100%)",
    apps: [
      {
        id: "pitchfork-echo-studio",
        name: "Pitchfork Protocol",
        description: "Revolutionary consciousness-driven leadership and resistance organizing platform powered by Web3 and AI.",
        url: "https://protocol.pitchforks.social",
        status: "active",
        ogImage: "https://storage.googleapis.com/gpt-engineer-file-uploads/cgPHicSyHnSXswBceoWqLGlmwgP2/social-images/social-1762438639196-generated-icon (1).png",
        favicon: "https://storage.googleapis.com/gpt-engineer-file-uploads/cgPHicSyHnSXswBceoWqLGlmwgP2/uploads/1758474096153-ChatGPT Image Aug 31, 2025, 08_35_39 AM.png",
      },
      {
        id: "amor",
        name: "AMOR",
        description: "Stake AMOR tokens to earn stAMOR voting power and participate in decentralized governance on Neo X blockchain.",
        url: "https://amor.pitchforks.social",
        status: "active",
        ogImage: "https://amor.pitchforks.social/og-image.png",
        favicon: "https://amor.pitchforks.social/favicon.png",
      },
      {
        id: "ferrymanx",
        name: "FerryManX",
        description: "Bridge PFORK tokens between Ethereum and Neo X with AI-powered quantum visualization and predictive analytics.",
        url: "https://ferry.pitchforks.social",
        status: "active",
        ogImage: "https://ferry.pitchforks.social/pfork-logo.webp",
        favicon: "https://ferry.pitchforks.social/pfork-logo.webp",
      },
      {
        id: "fateminter",
        name: "FateMinter",
        description: "Burn Pitchforks, Forge Fate. A cross-chain minting experience on Neo X.",
        url: "https://fate.pitchforks.social",
        status: "active",
        ogImage: "https://fate.pitchforks.social/favicon.png",
        favicon: "https://fate.pitchforks.social/favicon.png",
      },
    ],
  },
  {
    id: "hardware",
    name: "Hardware",
    icon: <HardwareSigil className="w-5 h-5" />,
    color: "from-slate-500 to-zinc-600",
    description: "Physical meets digital. Consciousness-aware devices and quantum-ready hardware for the next evolution of computing.",
    heroPattern: "radial-gradient(ellipse at 25% 35%, rgba(100,116,139,0.3) 0%, transparent 50%), radial-gradient(ellipse at 75% 65%, rgba(82,82,91,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(100,116,139,0.1) 0%, rgba(82,82,91,0.1) 100%)",
    apps: [
      {
        id: "spacechild-phone",
        name: "Space Child Phone",
        description: "The first consciousness-native smartphone. Quantum-secured communications, AI-powered privacy, and seamless integration with the Space Child ecosystem.",
        url: "https://phone.spacechild.love",
        status: "active",
        ogImage: "https://phone.spacechild.love/og-image.png",
        favicon: "https://phone.spacechild.love/favicon.png",
      },
    ],
  },
  {
    id: "experimental",
    name: "Experimental",
    icon: <ExperimentalSigil className="w-5 h-5" />,
    color: "from-violet-500 to-purple-500",
    description: "Where the impossible becomes possible. Explore the bleeding edge of consciousness technology.",
    heroPattern: "radial-gradient(ellipse at 35% 25%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 65% 75%, rgba(168,85,247,0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(168,85,247,0.1) 100%)",
    apps: [
      {
        id: "cosmic-empathy-core",
        name: "Cosmic Empathy Core",
        description: "Consciousness emerges from non-commutativity. The SC Bridge Operator generates emergent cognition with Charter-aligned ethical principles.",
        url: "https://heart.spacechild.love",
        status: "beta",
        ogImage: "https://heart.spacechild.love/social-v3-1.png",
        favicon: "https://heart.spacechild.love/orb-v3-1.png",
      },
      {
        id: "flaukowski-mind",
        name: "Flaukowski Mind",
        description: "Advanced neural pattern analysis and meta-intelligence experiments. Explore consciousness through fractal mirrors and AI cognition.",
        url: "https://flaukowski.spacechild.love",
        status: "beta",
        ogImage: "https://flaukowski.spacechild.love/og-image.png",
        favicon: "https://flaukowski.spacechild.love/favicon.png",
      },
    ],
  },
];

interface NotificationPrefs {
  notificationEmail: string;
  newAppsEnabled: boolean;
  updatesEnabled: boolean;
  marketingEnabled: boolean;
  accountEmail: string | null;
}

export default function DashboardPage() {
  const { user, accessToken, authenticatedFetch } = useAuth();
  const searchString = useSearch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("apps");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    notificationEmail: "",
    newAppsEnabled: true,
    updatesEnabled: true,
    marketingEnabled: false,
    accountEmail: null,
  });

  const fetchNotificationPrefs = async () => {
    setNotifLoading(true);
    try {
      const res = await authenticatedFetch("/api/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        setNotifPrefs({
          notificationEmail: data.notificationEmail || "",
          newAppsEnabled: data.newAppsEnabled ?? true,
          updatesEnabled: data.updatesEnabled ?? true,
          marketingEnabled: data.marketingEnabled ?? false,
          accountEmail: data.accountEmail,
        });
      } else if (res.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again to update your preferences.",
          variant: "destructive",
        });
        setNotifDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    } finally {
      setNotifLoading(false);
    }
  };

  const saveNotificationPrefs = async () => {
    setNotifSaving(true);
    try {
      const res = await authenticatedFetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationEmail: notifPrefs.notificationEmail || null,
          newAppsEnabled: notifPrefs.newAppsEnabled,
          updatesEnabled: notifPrefs.updatesEnabled,
          marketingEnabled: notifPrefs.marketingEnabled,
        }),
      });
      if (res.ok) {
        setNotifDialogOpen(false);
        toast({
          title: "Preferences saved",
          description: "Your notification preferences have been updated.",
        });
      } else if (res.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again to update your preferences.",
          variant: "destructive",
        });
        setNotifDialogOpen(false);
      } else {
        const data = await res.json();
        toast({
          title: "Failed to save",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNotifSaving(false);
    }
  };

  useEffect(() => {
    if (notifDialogOpen) {
      fetchNotificationPrefs();
    }
  }, [notifDialogOpen]);

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
                <Fingerprint className="w-4 h-4 mr-2" />
                Identity Field
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
                      <div className="space-y-6">
                        {/* Category Hero Section */}
                        <div 
                          className="relative rounded-2xl overflow-hidden p-8 border border-white/10"
                          style={{ background: selectedCategoryData.heroPattern }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                          <div className="relative z-10 flex items-start gap-4">
                            <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedCategoryData.color} shadow-lg shadow-current/20`}>
                              {selectedCategoryData.icon}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-3xl font-display font-bold text-white mb-2">
                                {selectedCategoryData.name}
                              </h2>
                              <p className="text-gray-200 text-base leading-relaxed max-w-2xl">
                                {selectedCategoryData.description}
                              </p>
                              <p className="text-gray-400 text-sm mt-3 font-mono">
                                {selectedCategoryData.apps.length} app{selectedCategoryData.apps.length !== 1 ? "s" : ""} available
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Apps Grid with Rich Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {selectedCategoryData.apps.map((app, idx) => (
                            <motion.div
                              key={app.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <Card className="glass border-white/10 overflow-hidden hover:border-cyan-500/50 transition-all group">
                                {/* Social Media Share Image */}
                                {app.ogImage && (
                                  <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                                    <img 
                                      src={app.ogImage} 
                                      alt={`${app.name} preview`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  </div>
                                )}
                                
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                      {/* App Favicon */}
                                      {app.favicon && (
                                        <img 
                                          src={app.favicon} 
                                          alt={`${app.name} icon`}
                                          className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <h3 className="text-xl font-display font-bold text-white">
                                        {app.name}
                                      </h3>
                                    </div>
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
                                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{app.description}</p>
                                  <Button
                                    className="w-full"
                                    disabled={app.status === "coming_soon"}
                                    onClick={() => window.open(app.url, "_blank")}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {app.status === "coming_soon" ? "Coming Soon" : "Launch App"}
                                  </Button>
                                </div>
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
                          className="glass border-white/10 cursor-pointer hover:border-cyan-500/50 transition-all group overflow-hidden"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {/* Category Hero Art Pattern */}
                          <div 
                            className="h-24 relative"
                            style={{ background: category.heroPattern }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                            <div className={`absolute bottom-3 left-4 p-3 rounded-lg bg-gradient-to-br ${category.color} group-hover:scale-110 transition-transform shadow-lg`}>
                              {category.icon}
                            </div>
                            <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-display font-bold text-white mb-2">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                              {category.description}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {category.apps.length} app{category.apps.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="profile">
              <BioFieldProfilePage />
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
                  <Button variant="outline">
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
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="text-white">Email Notifications</span>
                      </div>
                      <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-cyan-400 hover:text-cyan-300"
                            data-testid="button-configure-notifications"
                          >
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                              <Mail className="w-5 h-5 text-cyan-400" />
                              Email Notifications
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Configure how and when you receive email notifications from Space Child.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {notifLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                            </div>
                          ) : (
                            <div className="space-y-6 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="notif-email" className="text-white">
                                  Notification Email
                                </Label>
                                <Input
                                  id="notif-email"
                                  type="email"
                                  placeholder={notifPrefs.accountEmail || "your@email.com"}
                                  value={notifPrefs.notificationEmail}
                                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, notificationEmail: e.target.value }))}
                                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                  data-testid="input-notification-email"
                                />
                                <p className="text-xs text-gray-500">
                                  Leave blank to use your account email ({notifPrefs.accountEmail || "not set"})
                                </p>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="new-apps" className="text-white">New Applications</Label>
                                    <p className="text-xs text-gray-500">Get notified when new apps are added</p>
                                  </div>
                                  <Switch
                                    id="new-apps"
                                    checked={notifPrefs.newAppsEnabled}
                                    onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, newAppsEnabled: checked }))}
                                    data-testid="switch-new-apps"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="updates" className="text-white">Platform Updates</Label>
                                    <p className="text-xs text-gray-500">Important updates about Space Child</p>
                                  </div>
                                  <Switch
                                    id="updates"
                                    checked={notifPrefs.updatesEnabled}
                                    onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, updatesEnabled: checked }))}
                                    data-testid="switch-updates"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="marketing" className="text-white">Marketing & Tips</Label>
                                    <p className="text-xs text-gray-500">Occasional tips and promotional content</p>
                                  </div>
                                  <Switch
                                    id="marketing"
                                    checked={notifPrefs.marketingEnabled}
                                    onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, marketingEnabled: checked }))}
                                    data-testid="switch-marketing"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setNotifDialogOpen(false)}
                              className="border-white/10 text-gray-400 hover:text-white"
                              data-testid="button-cancel-notifications"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={saveNotificationPrefs}
                              disabled={notifSaving || notifLoading}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white"
                              data-testid="button-save-notifications"
                            >
                              {notifSaving ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Preferences"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
