import React, { useState } from 'react'
import { Shield, Key, Mail, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../App'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'

export default function Login() {
  const { login, setOtpVerifyEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (data.not_verified) {
          // Email not verified, redirect to OTP verify page
          setOtpVerifyEmail(email);
          window.location.hash = '#/verify-otp';
          return;
        }
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      // Successful login
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text cyber-grid scanline flex items-center justify-center p-6 relative">
      <a href="#/landing" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-cyber-slate hover:text-cyber-cyan transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </a>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Shield className="w-12 h-12 text-cyber-cyan cyber-pulse-cyan rounded-full p-1" />
          <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            CYBERSHIELD GATEWAY
          </h2>
          <p className="text-xs text-cyber-slate uppercase font-mono tracking-widest">Authorized Operations Access</p>
        </div>

        <GlassCard className="border border-cyber-border/40 shadow-cyber-cyan shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                  placeholder="analyst@cybershield.ai"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate">System Password</label>
                <a href="#/forgot-password" className="text-[10px] text-cyber-cyan hover:underline">
                  Forgot Password?
                </a>
              </div>
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

            <CyberButton 
              type="submit" 
              variant="cyan" 
              loading={loading}
              className="w-full font-bold text-xs mt-2"
            >
              Authenticate & Decrypt
            </CyberButton>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-cyber-border/30 text-xs">
            <span className="text-cyber-slate">New analyst terminal? </span>
            <a href="#/register" className="text-cyber-emerald font-semibold hover:underline">
              Register Credentials
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
