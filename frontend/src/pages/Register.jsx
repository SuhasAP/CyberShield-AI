import React, { useState } from 'react'
import { Shield, Key, Mail, User as UserIcon, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../App'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'

export default function Register() {
  const { setOtpVerifyEmail } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Analyst'); // Analyst by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Store email in state for verify otp screen
      setOtpVerifyEmail(email);
      
      // Auto display terminal OTP in a prompt or alert box to make the final presentation seamless
      alert(`[DEMO NOTICE] Registration successful!\nVerification OTP for presentation: ${data.otp_preview_for_demo}\n(This has also been printed to the Flask terminal logs)`);
      
      window.location.hash = '#/verify-otp';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text cyber-grid scanline flex items-center justify-center p-6 relative">
      <a href="#/login" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-cyber-slate hover:text-cyber-cyan transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </a>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-5">
          <Shield className="w-12 h-12 text-cyber-emerald cyber-pulse-cyan rounded-full p-1" />
          <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            REGISTER CREDENTIALS
          </h2>
          <p className="text-xs text-cyber-slate uppercase font-mono tracking-widest">Enroll New Security Analyst</p>
        </div>

        <GlassCard className="border border-cyber-border/40 shadow-cyber-emerald shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Username identifier</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                  placeholder="analyst_smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Analyst Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                  placeholder="smith@cybershield.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Security Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Operational Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
              >
                <option value="Analyst">Security Analyst</option>
                <option value="Admin">Security Administrator</option>
              </select>
            </div>

            <CyberButton 
              type="submit" 
              variant="emerald" 
              loading={loading}
              className="w-full font-bold text-xs mt-2"
            >
              Generate OTP & Register
            </CyberButton>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-cyber-border/30 text-xs">
            <span className="text-cyber-slate">Already enrolled? </span>
            <a href="#/login" className="text-cyber-cyan font-semibold hover:underline">
              Access Terminal
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
