import React, { useState } from 'react'
import { User, ShieldCheck, Mail, ShieldAlert, Key, AlertTriangle, CheckCircle, BellRing, Settings } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'
import { useAuth } from '../App'

export default function Profile() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [errorPass, setErrorPass] = useState('');
  const [successPass, setSuccessPass] = useState('');

  // Notification settings state
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    browserAlerts: true,
    weeklyReports: false,
    highRiskSms: false
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [successSettings, setSuccessSettings] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorPass('New passwords do not match.');
      return;
    }
    
    setLoadingPass(true);
    setErrorPass('');
    setSuccessPass('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setSuccessPass('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorPass(err.message);
    } finally {
      setLoadingPass(false);
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setLoadingSettings(true);
    setSuccessSettings('');
    
    setTimeout(() => {
      setLoadingSettings(false);
      setSuccessSettings('Operational preferences written successfully.');
      setTimeout(() => setSuccessSettings(''), 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar activePage="profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full overflow-hidden">
          
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight">Security Officer Profile Settings</h2>
            <p className="text-xs text-cyber-slate mt-0.5">Manage operational settings, credentials, and notification thresholds</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Analyst Identity details Card */}
            <div className="space-y-6">
              <GlassCard title="Security Officer Identity" className="border border-cyber-border/40 text-left" delay={0.05}>
                <div className="flex flex-col items-center text-center py-4 border-b border-cyber-border/30 mb-4">
                  <div className="w-20 h-20 rounded-full bg-cyber-cyan/10 border-2 border-cyber-cyan flex items-center justify-center text-cyber-cyan mb-3 shadow-cyber-cyan shadow-md">
                    <User className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-lg text-cyber-text">{user.username}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${user.role === 'Admin' ? 'bg-cyber-rose animate-pulse' : 'bg-cyber-emerald'}`} />
                    <span className="text-xs uppercase font-mono tracking-widest text-cyber-slate font-bold">
                      {user.role} Privilege
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-xs">
                    <Mail className="w-4.5 h-4.5 text-cyber-slate shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyber-slate">System Email</div>
                      <div className="text-cyber-text font-mono mt-0.5">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <ShieldCheck className="w-4.5 h-4.5 text-cyber-slate shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyber-slate">Signature Verification</div>
                      <div className="text-cyber-emerald font-bold uppercase mt-0.5 font-mono">Enforced & Signed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <ShieldAlert className="w-4.5 h-4.5 text-cyber-slate shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyber-slate">Officer ID Token</div>
                      <div className="text-cyber-slate font-mono mt-0.5 truncate text-[10px]">
                        cybershield_token_{user.id}_session
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Column 2: Password Form Card */}
            <GlassCard title="Update System Password" className="border border-cyber-border/40 text-left" delay={0.1}>
              {errorPass && (
                <div className="mb-4 p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorPass}</span>
                </div>
              )}

              {successPass && (
                <div className="mb-4 p-3 rounded bg-cyber-emerald/10 border border-cyber-emerald/25 text-cyber-emerald text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
                  <span>{successPass}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">New password</label>
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Confirm new password</label>
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
                  variant="cyan" 
                  loading={loadingPass}
                  className="w-full font-bold text-xs mt-2"
                >
                  Commit Credential Update
                </CyberButton>
              </form>
            </GlassCard>

            {/* Column 3: Notifications settings Form Card */}
            <GlassCard title="Threat Notification Preferences" className="border border-cyber-border/40 text-left" delay={0.15}>
              {successSettings && (
                <div className="mb-4 p-3 rounded bg-cyber-emerald/10 border border-cyber-emerald/25 text-cyber-emerald text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successSettings}</span>
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="space-y-3.5">
                  {/* Item 1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifs.emailAlerts}
                      onChange={(e) => setNotifs({ ...notifs, emailAlerts: e.target.checked })}
                      className="mt-1 rounded bg-slate-950 border-cyber-border text-cyber-cyan focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                        Real-time email Alerts
                      </div>
                      <p className="text-[10px] text-cyber-slate mt-0.5 leading-relaxed">
                        Dispatch email reports on high risk anomalies (DDoS/Malware).
                      </p>
                    </div>
                  </label>

                  {/* Item 2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifs.browserAlerts}
                      onChange={(e) => setNotifs({ ...notifs, browserAlerts: e.target.checked })}
                      className="mt-1 rounded bg-slate-950 border-cyber-border text-cyber-cyan focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                        Browser Push notifications
                      </div>
                      <p className="text-[10px] text-cyber-slate mt-0.5 leading-relaxed">
                        Flag immediate browser alerts when new threat vectors intercept the firewalls.
                      </p>
                    </div>
                  </label>

                  {/* Item 3 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifs.weeklyReports}
                      onChange={(e) => setNotifs({ ...notifs, weeklyReports: e.target.checked })}
                      className="mt-1 rounded bg-slate-950 border-cyber-border text-cyber-cyan focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                        Weekly analytics compilation
                      </div>
                      <p className="text-[10px] text-cyber-slate mt-0.5 leading-relaxed">
                        Automate compilation and email delivery of weekly security logs.
                      </p>
                    </div>
                  </label>

                  {/* Item 4 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifs.highRiskSms}
                      onChange={(e) => setNotifs({ ...notifs, highRiskSms: e.target.checked })}
                      className="mt-1 rounded bg-slate-950 border-cyber-border text-cyber-cyan focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                        SMS Crisis Alerts (Simulated)
                      </div>
                      <p className="text-[10px] text-cyber-slate mt-0.5 leading-relaxed">
                        Send text notification to on-call SOC admin for critical DDoS flood attacks.
                      </p>
                    </div>
                  </label>
                </div>

                <CyberButton 
                  type="submit" 
                  variant="slate" 
                  loading={loadingSettings}
                  className="w-full font-bold text-xs mt-4 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Save Preferences
                </CyberButton>
              </form>
            </GlassCard>

          </div>

        </main>
      </div>
    </div>
  );
}
