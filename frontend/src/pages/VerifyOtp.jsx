import React, { useState } from 'react'
import { Shield, ShieldCheck, Mail, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../App'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'

export default function VerifyOtp() {
  const { otpVerifyEmail } = useAuth();
  const [email, setEmail] = useState(otpVerifyEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code.');
      }

      setSuccess('Email verified successfully! Redirecting to login terminal...');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text cyber-grid scanline flex items-center justify-center p-6 relative">
      <a href="#/login" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-cyber-slate hover:text-cyber-cyan transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cancel & Return
      </a>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <ShieldCheck className="w-12 h-12 text-cyber-cyan cyber-pulse-cyan rounded-full p-1" />
          <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            OTP VERIFICATION
          </h2>
          <p className="text-xs text-cyber-slate uppercase font-mono tracking-widest">Verify Secure Signature</p>
        </div>

        <GlassCard className="border border-cyber-border/40 shadow-cyber-cyan shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded bg-cyber-emerald/10 border border-cyber-emerald/25 text-cyber-emerald text-xs flex items-start gap-2.5">
              <Shield className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Verify Email Address</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">6-Digit Access OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-3 text-center tracking-[0.5em] text-lg font-mono text-cyber-cyan font-bold transition-all"
                placeholder="000000"
              />
            </div>

            <CyberButton 
              type="submit" 
              variant="cyan" 
              loading={loading}
              className="w-full font-bold text-xs mt-2"
            >
              Verify Token Signature
            </CyberButton>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-cyber-border/30 text-xs text-cyber-slate font-mono">
            Check the Flask server terminal console for the verification OTP code output.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
