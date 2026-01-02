import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("scd-cookie-consent");
    const gpcSignal = (navigator as any).globalPrivacyControl;
    
    if (gpcSignal) {
      const gpcConsent = {
        essential: true,
        analytics: false,
        timestamp: new Date().toISOString(),
        gpcApplied: true,
      };
      localStorage.setItem("scd-cookie-consent", JSON.stringify(gpcConsent));
      applyConsent(false);
    } else if (!consent) {
      setTimeout(() => setShowBanner(true), 1500);
    } else {
      const parsed = JSON.parse(consent);
      applyConsent(parsed.analytics);
    }
  }, []);

  const applyConsent = (analyticsEnabled: boolean) => {
    if (!analyticsEnabled) {
      (window as any)['ga-disable-G-CMEBRPNPGG'] = true;
    }
  };

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
      gpcApplied: false,
    };
    localStorage.setItem("scd-cookie-consent", JSON.stringify(consent));
    applyConsent(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
      gpcApplied: false,
    };
    localStorage.setItem("scd-cookie-consent", JSON.stringify(consent));
    applyConsent(false);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
      gpcApplied: false,
    };
    localStorage.setItem("scd-cookie-consent", JSON.stringify(consent));
    applyConsent(preferences.analytics);
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <Card className="max-w-4xl mx-auto glass border-cyan-500/30 bg-black/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                    <Cookie className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">
                      Cookie Preferences
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">COMMAND_CENTER://PRIVACY_PROTOCOL</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
                  aria-label="Close cookie banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content */}
              <div className="text-gray-300 mb-6">
                <p className="mb-3 leading-relaxed">
                  Space Child Dream uses cookies to power your command center experience and understand how explorers navigate our ecosystem. Your privacy is protected—you control what data flows through the system.
                </p>
                
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 mt-4"
                  >
                    {/* Essential Cookies */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-cyan-400" />
                          <h3 className="font-semibold text-cyan-400">Essential Cookies</h3>
                        </div>
                        <span className="text-xs text-cyan-400/70 font-mono">ALWAYS_ACTIVE</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Required for authentication, security, and core command center functionality. These cannot be disabled without breaking your session.
                      </p>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) =>
                              setPreferences({ ...preferences, analytics: e.target.checked })
                            }
                            className="w-4 h-4 accent-purple-500 rounded"
                          />
                          <h3 className="font-semibold text-purple-400">Analytics Cookies</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Google Analytics helps us understand navigation patterns across the Space Child ecosystem. May be used for behavioral advertising.
                      </p>
                    </div>

                    {/* GPC Notice */}
                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong className="text-cyan-400">Global Privacy Control (GPC):</strong>{" "}
                        {(navigator as any).globalPrivacyControl ? (
                          <span className="text-green-400">
                            ✓ Signal detected—analytics automatically disabled.
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Not detected. Configure preferences manually above.
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  Review our{" "}
                  <Link href="/privacy">
                    <a className="text-cyan-400 hover:text-purple-400 underline transition-colors">
                      Privacy Policy
                    </a>
                  </Link>{" "}
                  for complete data handling protocols.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  className="glass border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  {showDetails ? "Hide Details" : "Manage Preferences"}
                </Button>
                
                {showDetails ? (
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleRejectAll}
                      className="glass border-gray-500/30 bg-gray-500/10 text-gray-300 hover:bg-gray-500/20"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Accept All
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
