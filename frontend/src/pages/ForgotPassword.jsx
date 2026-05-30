import React, { useState } from 'react'
import { Shield, Key, Mail, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: request, 2: reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP.');

      alert(`[DEMO NOTICE] Reset OTP generated!\nReset OTP for presentation: ${data.otp_preview_for_demo}\n(This has also been printed to the Flask terminal logs)`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      setSuccess('Password updated successfully! Redirecting to login terminal...');
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
          <Shield className="w-12 h-12 text-cyber-amber cyber-pulse-cyan rounded-full p-1" />
          <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            PASSWORD RECOVERY
          </h2>
          <p className="text-xs text-cyber-slate uppercase font-mono tracking-widest">Emergency Analyst Recovery</p>
        </div>

        <GlassCard className="border border-cyber-border/40 shadow-cyber-amber shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded bg-cyber-emerald/10 border border-cyber-emerald/25 text-cyber-emerald text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Registered Analyst Email</label>
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

              <CyberButton 
                type="submit" 
                variant="cyan" 
                loading={loading}
                className="w-full font-bold text-xs mt-2"
              >
                Send Recovery OTP
              </CyberButton>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              <div className="text-center bg-cyan-950/20 border border-cyber-cyan/20 p-2.5 rounded text-xs text-cyber-slate mb-3 font-mono">
                OTP recovery sent to {email}
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Verification OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-center text-sm font-mono text-cyber-cyan font-bold transition-all"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">New password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyber-slate mb-1">Confirm new password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <CyberButton 
                type="submit" 
                variant="amber" 
                loading={loading}
                className="w-full font-bold text-xs mt-2"
              >
                Reset Password
              </CyberButton>
            </form>
          )}

          <div className="text-center mt-5 pt-4 border-t border-cyber-border/30 text-xs">
            <span className="text-cyber-slate">Remember password? </span>
            <a href="#/login" className="text-cyber-cyan font-semibold hover:underline">
              Access Terminal
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
