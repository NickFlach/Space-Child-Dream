import { motion } from "framer-motion";
import { Shield, Eye, Lock, Database, Globe, Heart, Sparkles, Server, Cpu } from "lucide-react";
import { Link } from "wouter";
import { ImmersiveBackground } from "@/components/immersive-background";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-black text-gray-300 relative overflow-x-hidden">
      <ImmersiveBackground imageSrc={generatedImage} />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-display font-bold text-cyan-400 hover:text-purple-400 transition-colors">
              <Sparkles className="w-5 h-5" />
              Space Child Dream
            </a>
          </Link>
          <nav className="flex gap-6 text-sm font-mono">
            <Link href="/terms">
              <a className="text-gray-400 hover:text-cyan-400 transition-colors">Terms</a>
            </Link>
            <Link href="/">
              <a className="text-gray-400 hover:text-cyan-400 transition-colors">Home</a>
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(6,182,212,0.3)",
                  "0 0 40px rgba(147,51,234,0.3)", 
                  "0 0 20px rgba(6,182,212,0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-400 font-mono">
              DATA_PROTECTION://COMMAND_CENTER
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: January 2, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-10 glass border-cyan-500/20 p-8 rounded-2xl">
            <div className="flex items-start gap-4 mb-4">
              <Heart className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Our Commitment</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Welcome to Space Child Dream—the central command center for the Space Child ecosystem. As the authentication hub connecting all our applications, we take your privacy with utmost seriousness. Your data flows through neural pathways we've designed with intention and protection.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  This Privacy Policy is both legally compliant (GDPR, CCPA, state privacy laws) and aligned with our mission of conscious technology. Every data point is handled with purpose. Every protection is implemented with care.
                </p>
              </div>
            </div>
          </section>

          {/* Who We Are */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Who We Are
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-purple-400">Space Child, LLC</strong> operates the Space Child Dream command center along with the broader Space Child ecosystem of applications including research platforms, creative tools, learning environments, and consciousness-aware technology.
            </p>
            <p className="text-gray-400 text-sm">
              For privacy inquiries: <span className="text-cyan-400">info@spacechild.love</span>
            </p>
          </section>

          {/* Data We Collect */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" />
              What We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Account & Authentication Data</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  As the central authentication hub, we collect and securely store:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-cyan-400">Identity Information:</strong> Name, email address, username</li>
                  <li><strong className="text-cyan-400">Authentication Credentials:</strong> Securely hashed passwords, session tokens</li>
                  <li><strong className="text-cyan-400">SSO Data:</strong> Cross-application authentication tokens for seamless access</li>
                  <li><strong className="text-cyan-400">Account Preferences:</strong> Settings, notification preferences, connected apps</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Automatically Collected Data</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-cyan-400">Analytics Data:</strong> Via Google Analytics (geography, demographics, behavior patterns)</li>
                  <li><strong className="text-cyan-400">Technical Data:</strong> IP address, browser type, device information, operating system</li>
                  <li><strong className="text-cyan-400">Usage Data:</strong> Pages visited, authentication events, app access patterns</li>
                  <li><strong className="text-cyan-400">Cookies:</strong> Essential session cookies, optional analytics cookies</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <p className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Central Hub Security
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  As the authentication backbone for all Space Child applications, we implement bank-grade encryption for credential storage, JWT tokens with secure rotation, and Zero-Knowledge Proof verification where applicable.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              How We Use Your Data
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Every data operation serves a clear purpose within the Space Child ecosystem:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-cyan-400">Authentication:</strong> Secure login across all Space Child applications via SSO</li>
                <li><strong className="text-cyan-400">Account Management:</strong> Profile updates, password resets, email verification</li>
                <li><strong className="text-cyan-400">Ecosystem Access:</strong> Manage permissions and access to connected applications</li>
                <li><strong className="text-cyan-400">Analytics & Improvement:</strong> Understand usage patterns to enhance the command center</li>
                <li><strong className="text-cyan-400">Security:</strong> Detect unauthorized access, prevent abuse, maintain system integrity</li>
                <li><strong className="text-cyan-400">Communication:</strong> Service updates, security alerts, optional newsletters</li>
                <li><strong className="text-cyan-400">Legal Compliance:</strong> Meet regulatory obligations (GDPR, CCPA, AML requirements)</li>
              </ul>

              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg mt-4">
                <p className="text-purple-400 font-semibold mb-2">✧ Data Integrity Promise</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We will <strong>never</strong> sell your personal data. We will <strong>never</strong> share authentication credentials with third parties. Your identity within the Space Child ecosystem remains protected.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Data Sharing & Third Parties</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              We share data only when necessary for service operation or legal compliance:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Service Providers</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-cyan-400">Google Analytics:</strong> Website analytics and usage insights</li>
                  <li><strong className="text-cyan-400">Neon Database:</strong> Secure PostgreSQL hosting for authentication data</li>
                  <li><strong className="text-cyan-400">Email Services:</strong> Transactional emails (verification, password reset)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Space Child Ecosystem</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Your authentication data is shared with Space Child applications you choose to access (research.spacechild.love, fashion.spacechild.love, etc.) via secure SSO tokens. Only necessary identity data is transmitted—never your password.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Legal Requirements</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  We may disclose data if legally required (subpoenas, court orders, government investigations) or to protect rights, safety, and property. We'll resist overbroad requests and notify you when legally permitted.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Your Rights (GDPR, CCPA, State Laws)
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              You have authority over your data. These rights are protected by law:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">🔍 Right to Access</h3>
                <p className="text-gray-400 text-sm">Request a copy of all personal data we hold about you</p>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">✏️ Right to Correction</h3>
                <p className="text-gray-400 text-sm">Update or fix inaccurate information</p>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">🗑️ Right to Deletion</h3>
                <p className="text-gray-400 text-sm">Request removal of your personal data (with legal exceptions)</p>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">🚫 Right to Opt-Out</h3>
                <p className="text-gray-400 text-sm">Stop data sharing/selling (CCPA) or marketing communications</p>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">📦 Right to Portability</h3>
                <p className="text-gray-400 text-sm">Receive your data in machine-readable format (GDPR)</p>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">⏸️ Right to Restrict</h3>
                <p className="text-gray-400 text-sm">Limit how we process your data</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 p-4 rounded-lg">
              <p className="text-purple-400 font-semibold mb-2">✉️ Exercise Your Rights</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Contact us at <span className="text-cyan-400">info@spacechild.love</span> to exercise any of these rights. We respond within 30 days (GDPR) or 45 days (CCPA). No fees. No friction.
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg mt-4">
              <p className="text-cyan-400 font-semibold mb-2">🌐 Global Privacy Control (GPC)</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                We recognize and honor Global Privacy Control signals. If your browser sends a GPC signal, we treat it as a valid opt-out request under applicable privacy laws.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Cookie Policy</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies to maintain your authenticated sessions and understand command center usage:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Essential Cookies</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Required for authentication, session management, and security. These cannot be disabled without breaking your login experience across the Space Child ecosystem.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Analytics Cookies</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Google Analytics cookies help us understand how explorers navigate the command center. You can opt-out via our cookie banner or browser settings.
                </p>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <strong className="text-purple-400">Manage Your Preferences:</strong> Use our cookie consent banner (appears on first visit) or adjust settings in your browser. Most browsers allow you to refuse cookies entirely.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Cpu className="w-6 h-6" />
              Data Security
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              As the authentication backbone, we implement rigorous security measures:
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-cyan-400">Encryption:</strong> HTTPS/TLS for all data in transit, bcrypt hashing for passwords</li>
              <li><strong className="text-cyan-400">Token Security:</strong> JWT tokens with secure rotation and expiration</li>
              <li><strong className="text-cyan-400">Access Controls:</strong> Role-based permissions, principle of least privilege</li>
              <li><strong className="text-cyan-400">Regular Audits:</strong> Security reviews and vulnerability assessments</li>
              <li><strong className="text-cyan-400">Secure Infrastructure:</strong> Industry-leading hosting with Neon Database</li>
            </ul>

            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              No system is perfectly secure. We implement robust protections but cannot guarantee absolute security. We'll notify you of any data breaches as required by law.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Data Retention</h2>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-cyan-400">Account Data:</strong> Retained while your account is active, deleted upon account closure request</li>
              <li><strong className="text-cyan-400">Authentication Logs:</strong> 90 days for security purposes</li>
              <li><strong className="text-cyan-400">Analytics Data:</strong> Per Google Analytics retention settings (default: 14 months)</li>
              <li><strong className="text-cyan-400">Legal Requirements:</strong> Some data may be retained longer for compliance or dispute resolution</li>
            </ul>
          </section>

          {/* AML Compliance */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">AML & Financial Compliance</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              For applications within the Space Child ecosystem that involve financial transactions or token-based features:
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-cyan-400">Identity Verification:</strong> We may require additional verification for financial features</li>
              <li><strong className="text-cyan-400">Transaction Monitoring:</strong> Automated systems detect suspicious patterns</li>
              <li><strong className="text-cyan-400">Regulatory Reporting:</strong> We comply with applicable AML/KYC regulations</li>
              <li><strong className="text-cyan-400">Record Keeping:</strong> Financial records retained as required by law (typically 5-7 years)</li>
            </ul>

            <p className="text-gray-400 text-sm mt-4">
              These requirements apply only to financial features and are implemented to protect all users from fraud and money laundering.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">International Data Transfers</h2>
            
            <p className="text-gray-300 leading-relaxed">
              Space Child operates globally. Your data may be transferred to and processed in the United States or other countries where our service providers operate. We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses (SCCs) for GDPR compliance.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Children's Privacy</h2>
            
            <p className="text-gray-300 leading-relaxed">
              Space Child Dream is not directed to children under 13 (or 16 in the EU). We do not knowingly collect personal information from children. If we discover we've collected data from a child, we'll delete it promptly. Parents/guardians who believe we may have information about their child should contact us immediately.
            </p>
          </section>

          {/* State-Specific */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">State-Specific Privacy Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">California Residents (CCPA/CPRA)</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  Under California law, you have the right to know what personal information we collect, request deletion, opt-out of data sales/sharing, correct inaccurate information, and non-discrimination for exercising your rights.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Other State Privacy Laws</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive privacy laws have similar rights. Contact us to exercise these rights.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                <p className="text-cyan-400 font-semibold mb-2">📊 CCPA Data Categories (Last 12 Months)</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Identifiers (name, email, IP address, user ID)</li>
                  <li>• Internet/network activity (browsing behavior, authentication events)</li>
                  <li>• Geolocation data (approximate location via IP)</li>
                  <li>• Inferences (preferences derived from usage)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Changes to This Policy</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              As Space Child evolves, this Privacy Policy may change. We'll update the "Last Updated" date and notify you of material changes via email or prominent notice on the command center.
            </p>

            <p className="text-gray-400 text-sm">
              Continued use after changes constitutes acceptance. If you disagree with changes, please discontinue use and request data deletion.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Contact Us</h2>
            
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-6 rounded-lg">
              <p className="text-purple-400 font-bold text-lg mb-2">Space Child, LLC</p>
              <p className="text-gray-300 text-sm mb-1">
                <strong className="text-cyan-400">Email:</strong> info@spacechild.love
              </p>
              <p className="text-gray-400 text-xs mt-4">
                We respond to privacy requests within 30 days (GDPR) or 45 days (CCPA). Your data. Your rights. Our commitment.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section className="glass border-cyan-500/20 p-8 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-purple-500/5">
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-4"
              >
                <Sparkles className="w-12 h-12 mx-auto text-purple-400" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Privacy at the Command Center
              </h2>
              <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                As the central hub connecting the Space Child ecosystem, we hold your trust sacred. Every authentication, every connection, every data point is protected with the same consciousness we bring to all our technology. Thank you for exploring with us.
              </p>
              <p className="text-cyan-400 text-sm mt-6 font-mono">
                ✧ Secure connections ✧ Protected identity ✧ Conscious data handling ✧
              </p>
            </div>
          </section>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 bg-black/80 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 Space Child, LLC • Command Center</p>
          <div className="flex justify-center gap-6 mt-2">
            <Link href="/privacy">
              <a className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            </Link>
            <a href="https://trakkr.ai/r/nick" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
              Trakkr
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
