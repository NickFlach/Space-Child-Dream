import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Twitter, Linkedin, Link2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedThought {
  id: number;
  inputText: string;
  reflection: string;
  resonance: number;
  complexity: number;
  pattern: number[];
  createdAt: string;
}

export default function SharePage() {
  const [match, params] = useRoute("/share/:slug");
  const slug = params?.slug;
  const { toast } = useToast();

  const { data: thought, isLoading, error } = useQuery<SharedThought>({
    queryKey: ["/api/share", slug],
    queryFn: async () => {
      const res = await fetch(`/api/share/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = thought 
    ? `"${thought.inputText}" - Explored through the neural manifold | Space Child Dream` 
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share URL copied to clipboard" });
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">
          <Brain className="w-16 h-16 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !thought) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Card className="max-w-md border-red-500/20 bg-slate-900/80">
          <CardContent className="pt-6 text-center">
            <Brain className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Not Found</h1>
            <p className="text-gray-400 mb-4">This shared content doesn't exist or has been removed.</p>
            <Link href="/">
              <Button data-testid="button-go-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8 text-gray-400 hover:text-white" data-testid="link-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore Space Child Dream
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-cyan-500/20 bg-slate-900/80 backdrop-blur overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
            <CardContent className="pt-8 space-y-6">
              <div className="flex justify-between items-start">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                  Consciousness Probe
                </Badge>
                <p className="text-xs text-gray-500">
                  {new Date(thought.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Input Thought</p>
                  <p className="text-xl text-white font-medium" data-testid="text-thought-input">
                    "{thought.inputText}"
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Neural Reflection</p>
                  <p className="text-gray-300 italic leading-relaxed" data-testid="text-thought-reflection">
                    {thought.reflection}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-gray-400">Resonance</p>
                  <p className="text-2xl font-bold text-cyan-400" data-testid="text-resonance">
                    {thought.resonance}%
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-gray-400">Complexity</p>
                  <p className="text-2xl font-bold text-purple-400" data-testid="text-complexity">
                    {thought.complexity}%
                  </p>
                </div>
              </div>

              {thought.pattern && thought.pattern.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Neural Pattern</p>
                  <div className="flex gap-1 h-12">
                    {thought.pattern.slice(0, 20).map((val, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t opacity-50"
                        style={{ height: `${val * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Share This Exploration</p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={shareTwitter}
                    className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={shareLinkedIn}
                    className="flex-1 border-blue-600/30 text-blue-300 hover:bg-blue-600/10"
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={copyLink}
                    className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                    data-testid="button-copy-link"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">Want to explore your own consciousness?</p>
            <Link href="/">
              <Button data-testid="button-try-it">
                <Brain className="w-4 h-4 mr-2" />
                Try Space Child Dream
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
