import React, { useState } from 'react'
import { Shield, Lock, Cpu, BarChart3, Users, Mail, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'

export default function Landing() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/dashboard/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        })
      });
      if (res.ok) {
        setFormSubmitted(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      alert('Network error submitting inquiry: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };


  const features = [
    {
      icon: Cpu,
      title: "AI Inference Threat Detection",
      desc: "Uses a Random Forest classifier to instantly label incoming network traffic flows as malware, DDoS attacks, botnet scans, phishing, or baseline operations."
    },
    {
      icon: Shield,
      title: "Real-time Alerts Engine",
      desc: "Instantly logs malicious activity, updates local firewall telemetry, and triggers actionable security mitigation playbooks based on risk assessment scores."
    },
    {
      icon: BarChart3,
      title: "Interactive Security Dashboards",
      desc: "Aggregates threats and presents interactive visual metrics, severity breakdowns, and threat frequency timelines for seamless monitoring."
    },
    {
      icon: Lock,
      title: "Role-Based Audit Systems",
      desc: "Guards network logs and PDF exports with robust role checks (Admin/Analyst) and comprehensive user session security audits."
    }
  ];

  const stats = [
    { value: "99.8%", label: "ML Classification Accuracy" },
    { value: "45ms", label: "Average Inference Latency" },
    { value: "10k+", label: "Daily Scans Processed" },
    { value: "24/7", label: "Autonomous Security Operations" }
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Lead Security Architect, CySecure",
      text: "The ML classification speed and automated recommendation systems are outstanding. It has dramatically streamlined our SOC triage process."
    },
    {
      name: "Dr. Elena Rostova",
      role: "Director of cybersecurity research, CyberLabs",
      text: "An exemplary presentation of full-stack AI security integration. The feature correlation and real-time visualization are state-of-the-art."
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text cyber-grid scanline">
      {/* Navbar */}
      <nav className="glass-panel border-x-0 border-t-0 border-b border-cyber-border sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyber-cyan cyber-pulse-cyan rounded-full p-0.5" />
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            CYBERSHIELD AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#/login" className="text-sm font-semibold text-cyber-slate hover:text-cyber-cyan transition-colors">
            Login
          </a>
          <a href="#/register">
            <CyberButton variant="cyan" className="py-1.5 px-4 text-xs">
              Register Analyst
            </CyberButton>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono font-bold uppercase tracking-widest">
              SecOps Threat Analysis Platform
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
          >
            Autonomous Threat <br />
            <span className="bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
              Detection Powered By AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-cyber-slate text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Deploy adaptive Machine Learning network inspection classifiers to intercept DDoS floods, malware, phishing links, and botnets before they breach your firewall boundary.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <a href="#/login">
              <CyberButton variant="cyan" className="flex items-center gap-2">
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </a>
            <a href="#features">
              <CyberButton variant="slate">Explore Features</CyberButton>
            </a>
          </motion.div>
        </div>

        {/* Cybersecurity Animation Graphic */}
        <div className="flex-1 w-full flex justify-center relative">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[450px]"
          >
            <div className="relative glass-panel rounded-2xl p-6 border-2 border-cyber-cyan/20 shadow-cyber-cyan shadow-xl overflow-hidden aspect-video flex flex-col justify-between">
              {/* Animated HUD Grid */}
              <div className="absolute inset-0 bg-cyan-950/20 opacity-40 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-rose animate-ping" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-cyber-rose font-bold">Threat Alert: Active Scanning</span>
                </div>
                <span className="text-[10px] text-cyber-slate font-mono">FLOW_ID: 1042</span>
              </div>
              
              <div className="my-6 space-y-3 z-10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyber-slate">Source IP:</span>
                  <span className="text-cyber-text">185.190.140.231</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyber-slate">Target Host:</span>
                  <span className="text-cyber-text">10.0.0.84</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: "10%" }}
                    animate={{ width: ["10%", "85%", "10%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-cyber-rose h-1.5"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-cyber-border/40 pt-4 z-10">
                <div className="text-[11px] font-mono text-cyber-slate">Prediction Classification:</div>
                <div className="text-xs font-mono font-bold text-cyber-rose">BOTNET_ACTIVITY (96.5%)</div>
              </div>
            </div>
            {/* Ambient decorative glowing backdrops */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 rounded-full bg-cyber-cyan/15 blur-[60px]" />
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-slate-950/80 border-y border-cyber-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyber-cyan font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-cyber-slate font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Core Platform Capability
          </h2>
          <p className="text-cyber-slate text-sm sm:text-base">
            Equipped with multi-dimensional network feature parsers, local sandbox logs, and security recommendations engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <GlassCard 
                key={i} 
                hoverable 
                className="flex gap-4 items-start border border-cyber-border/40"
              >
                <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan mt-1">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-cyber-text text-left">{feat.title}</h3>
                  <p className="text-sm text-cyber-slate text-left leading-relaxed">{feat.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 max-w-7xl mx-auto space-y-12 bg-slate-900/30 rounded-3xl border border-cyber-border/40">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Analyst Feedback</h2>
          <p className="text-cyber-slate text-xs sm:text-sm">Trusted by security operations groups and academic evaluators alike.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <GlassCard key={i} className="flex flex-col justify-between border border-cyber-border/30">
              <p className="italic text-sm text-cyber-slate leading-relaxed text-left">"{t.text}"</p>
              <div className="mt-4 pt-3 border-t border-cyber-border/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyber-cyan/15 flex items-center justify-center font-bold text-xs text-cyber-cyan">
                  {t.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-cyber-text">{t.name}</div>
                  <div className="text-[10px] text-cyber-slate font-mono">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Info Column */}
          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-extrabold">Get In Touch</h2>
            <p className="text-cyber-slate text-sm leading-relaxed">
              Have questions regarding AI telemetry tuning, deployment playbooks, or academic code integrations? Send us an inquiry and our operations group will reply shortly.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-cyber-cyan" />
                <span className="text-cyber-slate">suhasap110806@gmail.com / operations@cybershield.ai</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-cyber-cyan" />
                <span className="text-cyber-slate">7338416261 / +1 (800) 555-CYBER</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-cyber-cyan" />
                <span className="text-cyber-slate">Shikaripura, Shivamogga, 577214, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <GlassCard title="Security Inquiry Form" className="border border-cyber-border/40">
            {formSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <CheckCircle className="w-12 h-12 text-cyber-emerald animate-bounce" />
                <h4 className="font-bold text-cyber-emerald">Message Dispatched</h4>
                <p className="text-xs text-cyber-slate">Your inquiry has been encrypted and routed to CyShield Ops.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Inquiry Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="Enter security inquiry description..."
                  />
                </div>
                <CyberButton type="submit" variant="cyan" loading={submitLoading} className="w-full text-xs font-bold mt-2">
                  Send Encrypted Message
                </CyberButton>
              </form>
            )}
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-8 text-center text-xs text-cyber-slate font-mono">
        &copy; {new Date().getFullYear()} CyberShield AI Platform. All rights reserved. Encrypted Connection.
      </footer>
    </div>
  );
}
