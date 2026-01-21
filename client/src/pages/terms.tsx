import { motion } from "framer-motion";
import { Scale, AlertTriangle, Shield, Zap, Heart, Sparkles, Users, Code, Ban, Server } from "lucide-react";
import { Link } from "wouter";
import { ImmersiveBackground } from "@/components/immersive-background";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

export default function TermsPage() {
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
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy</a>
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
              <Scale className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-400 font-mono">
              AGREEMENT://COMMAND_CENTER_PROTOCOL
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
                <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Welcome to the Command Center</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These Terms of Service ("Terms") govern your access to and use of Space Child Dream—the central authentication hub and command center for the Space Child ecosystem. By entering this digital space, you agree to these Terms. If you don't align with them, please don't use our services.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We've crafted these Terms to be both legally sound and true to our mission of conscious technology. Every clause carries intention. Every boundary is set with respect.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Acceptance of Terms
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              By accessing Space Child Dream's website, authentication services, or connected applications (collectively, the "Services"), you enter into a binding legal agreement with <strong className="text-purple-400">Space Child, LLC</strong> ("we," "us," "our"). This agreement includes:
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
              <li>These Terms of Service</li>
              <li>Our Privacy Policy</li>
              <li>Terms specific to individual applications in the Space Child ecosystem</li>
              <li>Any additional terms presented when you use specific features</li>
            </ul>

            <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
              <p className="text-purple-400 font-semibold mb-2">⚡ Important Notice</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                If you don't agree with these Terms, you must discontinue use immediately. Continued use constitutes acceptance. You must be at least 13 years old (or 16 in the EU) to use our Services.
              </p>
            </div>
          </section>

          {/* The Service */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Server className="w-6 h-6" />
              What We Offer
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Space Child Dream serves as the <strong className="text-purple-400">central command center</strong> for the Space Child ecosystem. Our Services include:
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-cyan-400">Unified Authentication:</strong> Single Sign-On (SSO) across all Space Child applications</li>
              <li><strong className="text-cyan-400">Account Management:</strong> Profile, security settings, and preferences</li>
              <li><strong className="text-cyan-400">Ecosystem Access:</strong> Gateway to research, fashion, learning, development, and experimental applications</li>
              <li><strong className="text-cyan-400">Identity Protection:</strong> Secure credential management and verification</li>
            </ul>

            <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg mt-4">
              <p className="text-cyan-400 font-semibold mb-2">🌌 Ecosystem Nature</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Space Child Dream connects you to multiple applications, each with their own features and potentially their own supplementary terms. The command center is actively evolving—features may change as we refine our conscious technology approach.
              </p>
            </div>
          </section>

          {/* Account Responsibilities */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Your Account Responsibilities
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              As a central authentication system, account security is paramount. You agree to:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Provide Accurate Information</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Register with truthful and current information. Update it if it changes. False information may result in account termination.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Protect Your Credentials</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your password and authentication tokens provide access to the entire Space Child ecosystem. Keep them confidential. Use strong, unique passwords. Enable additional security features when available. Notify us immediately if you suspect unauthorized access.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">One Account Per Person</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Each person should maintain only one account. Multiple accounts may be terminated without notice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Use Services Legally</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Comply with all applicable laws, regulations, and third-party rights. Don't use our Services for illegal activities.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibited Conduct */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6" />
              Prohibited Conduct
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              To maintain the integrity of the command center and ecosystem, you may <strong>NOT</strong>:
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 text-sm">
              <li><strong className="text-purple-400">Compromise Security:</strong> Attempt to bypass authentication, exploit vulnerabilities, or gain unauthorized access</li>
              <li><strong className="text-purple-400">Share Credentials:</strong> Allow others to use your account or share login information</li>
              <li><strong className="text-purple-400">Automate Access:</strong> Use bots, scrapers, or automated tools without permission</li>
              <li><strong className="text-purple-400">Impersonate:</strong> Pretend to be someone else or misrepresent your identity</li>
              <li><strong className="text-purple-400">Abuse Systems:</strong> Reverse engineer, hack, or attempt to extract source code</li>
              <li><strong className="text-purple-400">Spam or Harass:</strong> Send unsolicited communications or abuse other users</li>
              <li><strong className="text-purple-400">Spread Malware:</strong> Introduce viruses, malicious code, or harmful technology</li>
              <li><strong className="text-purple-400">Interfere with Services:</strong> Disrupt, damage, or impair platform functionality</li>
              <li><strong className="text-purple-400">Violate Rights:</strong> Infringe on intellectual property, privacy, or other legal rights</li>
              <li><strong className="text-purple-400">Financial Fraud:</strong> Engage in money laundering, fraud, or deceptive financial activities</li>
            </ul>

            <div className="bg-red-500/10 border border-red-400/30 p-4 rounded-lg mt-4">
              <p className="text-red-400 font-semibold mb-2">⚠️ Consequences</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Violation may result in immediate termination of your account across all Space Child applications, legal action, and reporting to appropriate authorities.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Code className="w-6 h-6" />
              Intellectual Property
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Our Content & Technology</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  All content, features, and functionality of Space Child Dream and the broader ecosystem—including design, code, text, graphics, logos, authentication systems, and consciousness-aware technology—are owned by Space Child, LLC and protected by intellectual property laws.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You may not copy, reproduce, distribute, modify, create derivative works, reverse engineer, or exploit our intellectual property without explicit written permission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Your Content</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Any content you submit (feedback, ideas, suggestions) may be used by us to improve our Services. By sharing, you grant us a worldwide, royalty-free, perpetual license to use, reproduce, modify, and distribute your submissions.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                <p className="text-purple-400 font-semibold mb-2">🎨 Trademarks</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "Space Child," "Space Child Dream," and associated logos are trademarks of Space Child, LLC. Unauthorized use is prohibited.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Privacy & Data Collection</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Your privacy is protected. Our collection and use of personal information is governed by our <Link href="/privacy" className="text-purple-400 hover:text-cyan-400 underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>

            <p className="text-gray-300 text-sm leading-relaxed">
              By using our Services, you consent to data collection and processing as described in the Privacy Policy. This includes authentication data, analytics, and information you voluntarily provide.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Disclaimers & Limitations
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-lg">
                <p className="text-yellow-400 font-semibold mb-2 uppercase text-sm">Legal Notice</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  THE FOLLOWING DISCLAIMERS LIMIT OUR LIABILITY. BY USING SPACE CHILD DREAM, YOU AGREE TO THESE LIMITATIONS.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">"As Is" Service</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  Space Child Dream is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranties of any kind. We do not guarantee that the Services will be:
                </p>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-4">
                  <li>Uninterrupted, secure, or error-free</li>
                  <li>Accurate, reliable, or complete</li>
                  <li>Free from bugs, viruses, or harmful components</li>
                  <li>Meeting your specific requirements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">No Professional Advice</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Space Child applications are <strong>not</strong> professional services. Do not rely on our Services for medical, financial, legal, or other professional advice. Consult qualified professionals for such needs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Third-Party Services</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We may integrate third-party services. We're not responsible for their functionality, availability, or privacy practices.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Limitation of Liability</h2>
            
            <div className="bg-red-500/10 border border-red-400/30 p-6 rounded-lg">
              <p className="text-red-400 font-bold mb-3 uppercase">Important Legal Limitation</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPACE CHILD, LLC SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-2 ml-4 mb-3">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages arising from your use or inability to use the Services</li>
                <li>Damages from unauthorized access or data breaches</li>
                <li>Damages from third-party conduct or content</li>
              </ul>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
              </p>
              <p className="text-gray-400 text-xs">
                Some jurisdictions don't allow exclusion of certain damages, so limitations may not fully apply.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Indemnification</h2>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              You agree to indemnify, defend, and hold harmless Space Child, LLC from any claims, damages, losses, and expenses arising from:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-2 ml-4 mt-3">
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or third-party rights</li>
              <li>Your use or misuse of the Services</li>
              <li>Unauthorized access to your account due to your negligence</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Termination</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Our Right to Terminate</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We reserve the right to suspend or terminate your access at any time, with or without cause, with or without notice. Termination affects your access to all connected Space Child applications.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Your Right to Terminate</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You may stop using our Services and request account deletion at any time. Contact us to initiate account closure and data removal per our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Effect of Termination</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Upon termination, your access to the command center and all connected applications ceases immediately. Surviving provisions include disclaimers, liability limitations, and dispute resolution.
                </p>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Dispute Resolution</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Informal Resolution First</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  If you have a dispute, please contact us first at <span className="text-cyan-400">info@spacechild.love</span>. We'll work in good faith to resolve issues through dialogue.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Governing Law</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  These Terms are governed by the laws of the State of Delaware, United States. You consent to the exclusive jurisdiction of Delaware courts for any legal disputes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Arbitration Agreement</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  For disputes that cannot be resolved informally, you agree to binding arbitration under the rules of the American Arbitration Association (AAA).
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  <strong className="text-purple-400">Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of class actions or representative proceedings.
                </p>
              </div>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Changes to These Terms</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              We may update these Terms as Space Child evolves. When we make material changes, we'll:
            </p>

            <ul className="list-disc list-inside text-gray-300 text-sm space-y-2 ml-4 mb-4">
              <li>Update the "Last Updated" date</li>
              <li>Notify you via email or prominent notice on the command center</li>
              <li>Give you reasonable time to review changes</li>
            </ul>

            <p className="text-gray-400 text-sm">
              Continued use after changes constitutes acceptance. If you disagree, discontinue use before the effective date.
            </p>
          </section>

          {/* General Provisions */}
          <section className="mb-10 glass border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">General Provisions</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Entire Agreement</h3>
                <p className="text-gray-300 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Space Child, LLC.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Severability</h3>
                <p className="text-gray-300 leading-relaxed">
                  If any provision is found unenforceable, the remaining provisions remain in full effect.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">No Waiver</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our failure to enforce any provision doesn't constitute a waiver of that provision.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Assignment</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may assign these Terms to affiliates or acquirers. You may not assign your rights without our consent.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Force Majeure</h3>
                <p className="text-gray-300 leading-relaxed">
                  We're not liable for delays or failures due to circumstances beyond our reasonable control.
                </p>
              </div>
            </div>
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
                Your feedback shapes our evolution. Reach out with questions, concerns, or ideas.
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
                <Zap className="w-12 h-12 mx-auto text-purple-400" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Command Center Agreements
              </h2>
              <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                These Terms protect both you and Space Child as we build the future of conscious technology together. Every boundary is set with intention. Every agreement honors autonomy. Thank you for being part of the ecosystem.
              </p>
              <p className="text-cyan-400 text-sm mt-6 font-mono">
                ✧ Agreements with intention ✧ Boundaries with respect ✧ Technology with consciousness ✧
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
            <a href="https://trakkr.ai/?ref=nick" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
              Trakkr
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
