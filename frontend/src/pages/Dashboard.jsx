import React, { useState, useEffect } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Activity, Terminal, AlertTriangle, AlertCircle, RefreshCw, Star, Trash2, MailOpen, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'
import { Line, Doughnut } from 'react-chartjs-2'
import { useAuth } from '../App'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveTraffic, setLiveTraffic] = useState([]);
  const [inquiries, setInquiries] = useState([]);


  // Fetch Dashboard Stats from Flask API
  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error("Failed to load statistics.");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/dashboard/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    }
  };

  const handleToggleStar = async (inqId) => {
    try {
      const res = await fetch(`/api/dashboard/inquiries/${inqId}/toggle-star`, {
        method: 'PUT'
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === inqId ? { ...inq, is_starred: !inq.is_starred } : inq));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (inqId) => {
    try {
      const res = await fetch(`/api/dashboard/inquiries/${inqId}/toggle-read`, {
        method: 'PUT'
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === inqId ? { ...inq, is_read: !inq.is_read } : inq));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (inqId) => {
    if (!window.confirm("Are you sure you want to delete this customer inquiry?")) return;
    try {
      const res = await fetch(`/api/dashboard/inquiries/${inqId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== inqId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (user && user.role === 'Admin') {
      fetchInquiries();
    }
  }, []);

  // Real-Time Traffic Simulation ticker (scrolling feed)
  useEffect(() => {
    const protocols = ['TCP', 'UDP', 'ICMP'];
    const anomalyTypes = ['Normal Traffic', 'Malware', 'DDoS Attack', 'Phishing Attack', 'Botnet Activity'];
    
    // Seed initial simulated flows
    const seedFlows = [];
    for (let i = 0; i < 6; i++) {
      seedFlows.push(generateSimulatedFlow(protocols, anomalyTypes));
    }
    setLiveTraffic(seedFlows);

    const interval = setInterval(() => {
      setLiveTraffic(prev => {
        const nextFlow = generateSimulatedFlow(protocols, anomalyTypes);
        // keep only latest 8 flows
        return [nextFlow, ...prev.slice(0, 7)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generateSimulatedFlow = (protocols, anomalyTypes) => {
    const isNormal = Math.random() > 0.45;
    const type = isNormal ? 'Normal Traffic' : anomalyTypes[Math.floor(Math.random() * (anomalyTypes.length - 1)) + 1];
    
    const srcIp = isNormal 
      ? `192.168.1.${Math.floor(Math.random() * 254) + 1}` 
      : `${Math.floor(Math.random() * 190) + 30}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`;
      
    const destIp = `10.0.0.${Math.floor(Math.random() * 150) + 2}`;
    const proto = protocols[Math.floor(Math.random() * protocols.length)];
    
    let risk = 0.0;
    if (type === 'Normal Traffic') risk = Math.random() * 12.0;
    else if (type === 'DDoS Attack') risk = 85.0 + Math.random() * 14.5;
    else if (type === 'Malware') risk = 70.0 + Math.random() * 25.0;
    else risk = 50.0 + Math.random() * 35.0;

    return {
      id: Math.floor(Math.random() * 900000) + 100000,
      timestamp: new Date().toLocaleTimeString(),
      source_ip: srcIp,
      destination_ip: destIp,
      protocol: proto,
      prediction: type,
      risk_score: parseFloat(risk.toFixed(1))
    };
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/dashboard/alerts/${alertId}/resolve?user_id=${user.id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        // reload stats cards and alerts list
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Line Chart styling configurations
  const getLineChartData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    const labels = stats.risk_trends.map(t => t.date);
    const safeData = stats.risk_trends.map(t => t.safe);
    const threatsData = stats.risk_trends.map(t => t.threats);
    
    return {
      labels,
      datasets: [
        {
          label: 'Threats Detected',
          data: threatsData,
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#F43F5E',
          pointHoverRadius: 6
        },
        {
          label: 'Safe Traffic',
          data: safeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#10B981',
          pointHoverRadius: 6
        }
      ]
    };
  };

  // Doughnut Chart styling configurations
  const getDoughnutChartData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    const dist = stats.threat_distribution;
    return {
      labels: ['Normal Traffic', 'Malware', 'DDoS Attack', 'Phishing Attack', 'Botnet Activity'],
      datasets: [
        {
          data: [
            dist['Normal Traffic'] || 0,
            dist['Malware'] || 0,
            dist['DDoS Attack'] || 0,
            dist['Phishing Attack'] || 0,
            dist['Botnet Activity'] || 0
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',  // Normal: Emerald
            'rgba(14, 165, 233, 0.75)',  // Malware: Cyan
            'rgba(244, 63, 94, 0.75)',   // DDoS: Rose
            'rgba(245, 158, 11, 0.75)',   // Phishing: Amber
            'rgba(148, 163, 184, 0.75)'  // Botnet: Slate
          ],
          borderColor: '#0f172a',
          borderWidth: 1.5
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94A3B8', font: { family: 'Outfit', size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8', font: { family: 'Outfit' } } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { color: '#94A3B8', font: { family: 'Outfit' } } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94A3B8', font: { family: 'Outfit', size: 11 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col items-center justify-center gap-4">
        <Activity className="w-12 h-12 text-cyber-cyan animate-spin" />
        <p className="font-mono text-xs text-cyber-slate">Decrypting Operational Telemetry database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar activePage="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Workspace Dashboard Content */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Dashboard Title Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-left">Security Intelligence Dashboard</h2>
              <p className="text-xs text-cyber-slate mt-0.5 text-left">Real-time status indicators and network telemetry predictions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <CyberButton 
                variant="slate" 
                onClick={fetchStats}
                loading={refreshing}
                className="py-2 px-3 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Synchronize Data
              </CyberButton>
            </div>
          </div>

          {/* Cards metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total threats card */}
            <GlassCard className="border border-cyber-rose/25 bg-cyber-rose/5" delay={0.05}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Total Threats Logged</span>
                  <div className="text-2xl font-bold font-mono mt-1 text-cyber-rose">{stats?.cards.total_threats}</div>
                </div>
                <div className="p-2 rounded bg-cyber-rose/10 text-cyber-rose">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            {/* Safe traffic card */}
            <GlassCard className="border border-cyber-emerald/25 bg-cyber-emerald/5" delay={0.1}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Safe Traffic Flows</span>
                  <div className="text-2xl font-bold font-mono mt-1 text-cyber-emerald">{stats?.cards.total_safe_traffic}</div>
                </div>
                <div className="p-2 rounded bg-cyber-emerald/10 text-cyber-emerald">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            {/* High Alerts card */}
            <GlassCard className="border border-cyber-border/40" delay={0.15}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Active High Risk</span>
                  <div className="text-2xl font-bold font-mono mt-1 text-cyber-rose">{stats?.cards.high_risk_alerts}</div>
                </div>
                <div className="p-1.5 px-2 rounded bg-cyber-rose/10 text-cyber-rose font-bold text-xs uppercase font-mono mt-0.5">
                  High
                </div>
              </div>
            </GlassCard>

            {/* Medium Alerts card */}
            <GlassCard className="border border-cyber-border/40" delay={0.2}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Active Medium Risk</span>
                  <div className="text-2xl font-bold font-mono mt-1 text-cyber-amber">{stats?.cards.medium_risk_alerts}</div>
                </div>
                <div className="p-1.5 px-2 rounded bg-cyber-amber/10 text-cyber-amber font-bold text-xs uppercase font-mono mt-0.5">
                  Med
                </div>
              </div>
            </GlassCard>

            {/* Low Alerts card */}
            <GlassCard className="border border-cyber-border/40" delay={0.25}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Active Low Risk</span>
                  <div className="text-2xl font-bold font-mono mt-1 text-cyber-cyan">{stats?.cards.low_risk_alerts}</div>
                </div>
                <div className="p-1.5 px-2 rounded bg-cyber-cyan/10 text-cyber-cyan font-bold text-xs uppercase font-mono mt-0.5">
                  Low
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend chart */}
            <GlassCard title="Security Telemetry Trends (7 Days)" className="lg:col-span-2 min-h-[300px] flex flex-col justify-between border border-cyber-border/40" delay={0.3}>
              <div className="h-64 mt-2">
                <Line data={getLineChartData()} options={chartOptions} />
              </div>
            </GlassCard>

            {/* Distribution Chart */}
            <GlassCard title="Threat Vector Distribution" className="min-h-[300px] flex flex-col justify-between border border-cyber-border/40" delay={0.35}>
              <div className="h-64 mt-2 relative flex items-center justify-center">
                <Doughnut data={getDoughnutChartData()} options={doughnutOptions} />
              </div>
            </GlassCard>
          </div>

          {/* Alerts & Live Simulated Traffic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Traffic Simulator */}
            <GlassCard 
              title="Real-Time Network Monitoring Simulation" 
              headerAction={
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse">
                  <Activity className="w-3.5 h-3.5 animate-spin" /> Live Ticker
                </div>
              }
              className="border border-cyber-border/40 h-[380px] flex flex-col overflow-hidden" 
              delay={0.4}
            >
              <div className="overflow-y-auto flex-1 text-left -mx-5 -mb-5 px-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cyber-border/30 text-[10px] font-bold uppercase tracking-wider text-cyber-slate font-mono">
                      <th className="py-2.5">Time</th>
                      <th className="py-2.5">Source IP</th>
                      <th className="py-2.5">Protocol</th>
                      <th className="py-2.5">Classification</th>
                      <th className="py-2.5 text-right">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/10 text-xs font-mono">
                    {liveTraffic.map((flow) => {
                      const isDanger = flow.prediction !== 'Normal Traffic';
                      return (
                        <tr 
                          key={flow.id} 
                          className={`
                            hover:bg-slate-800/20 transition-all duration-200
                            ${isDanger ? 'bg-cyber-rose/5 text-cyber-rose/90 font-bold' : ''}
                          `}
                        >
                          <td className="py-2.5 text-cyber-slate">{flow.timestamp}</td>
                          <td className="py-2.5">{flow.source_ip}</td>
                          <td className="py-2.5">{flow.protocol}</td>
                          <td className="py-2.5">
                            {isDanger ? (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 animate-bounce shrink-0" />
                                {flow.prediction}
                              </span>
                            ) : (
                              flow.prediction
                            )}
                          </td>
                          <td className={`py-2.5 text-right font-bold ${isDanger ? 'text-cyber-rose' : 'text-cyber-emerald'}`}>
                            {flow.risk_score}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Active System Alerts */}
            <GlassCard 
              title="Recent active Security Alerts" 
              className="border border-cyber-border/40 h-[380px] flex flex-col overflow-hidden" 
              delay={0.45}
            >
              <div className="overflow-y-auto flex-1 -mx-5 -mb-5 px-5 space-y-3.5 pb-5">
                {stats?.recent_alerts && stats.recent_alerts.filter(a => !a.is_resolved).length > 0 ? (
                  stats.recent_alerts.filter(a => !a.is_resolved).map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`
                        p-3 rounded border text-left flex items-start justify-between gap-3
                        ${alert.severity === 'High' ? 'border-cyber-rose/25 bg-cyber-rose/5' : 'border-cyber-amber/25 bg-cyber-amber/5'}
                      `}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'High' ? 'text-cyber-rose' : 'text-cyber-amber'}`} />
                        <div>
                          <div className="text-xs font-bold text-cyber-text">{alert.message}</div>
                          <div className="text-[10px] text-cyber-slate font-mono mt-1">
                            LOGGED: {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <CyberButton 
                        variant={alert.severity === 'High' ? 'rose' : 'amber'} 
                        onClick={() => handleResolveAlert(alert.id)}
                        className="py-1 px-2.5 text-[9px] uppercase tracking-widest shrink-0 font-bold"
                      >
                        Resolve
                      </CyberButton>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-cyber-slate">
                    <ShieldCheck className="w-10 h-10 text-cyber-emerald animate-pulse" />
                    <span className="text-xs font-mono">No active threats detected in security queue.</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Bottom Grid: Audit Trail & Admin Inquiries Inbox */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Security operations Audit Trail Console" className="border border-cyber-border/40 text-left" delay={0.5}>
              <div className="bg-slate-950/80 rounded border border-cyber-border/40 p-4 font-mono text-xs max-h-52 overflow-y-auto space-y-2 select-text h-[208px]">
                <div className="flex items-center gap-2 text-cyber-cyan border-b border-cyber-border/20 pb-2 mb-2">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">SecOps Shell Audit logs v1.0.4</span>
                </div>
                {stats?.recent_logs.map((log) => (
                  <div key={log.id} className="text-left text-cyber-slate leading-relaxed">
                    <span className="text-cyber-cyan">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className="text-cyber-emerald">ip={log.ip_address || 'system'}</span>{' '}
                    <span className="text-cyber-text">user={log.username}</span>{' '}
                    <span className="text-cyber-slate">action="{log.action}"</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {user && user.role === 'Admin' && (
              <GlassCard title="Landing Page Customer Inquiries Inbox" className="border border-cyber-border/40 text-left" delay={0.55}>
                <div className="bg-slate-950/80 rounded border border-cyber-border/40 p-4 font-mono text-xs max-h-52 overflow-y-auto space-y-2 h-[208px]">
                  <div className="flex items-center gap-2 text-cyber-emerald border-b border-cyber-border/20 pb-2 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">Inquiries Mailbox Inbox (Admin Access)</span>
                  </div>
                  {inquiries.length > 0 ? (
                    inquiries.map((inq) => (
                      <div 
                        key={inq.id} 
                        className={`
                          p-2 rounded border border-cyber-border/10 mb-2 text-left transition-all duration-300 flex justify-between items-start gap-2
                          ${inq.is_read ? 'bg-transparent opacity-80' : 'bg-cyan-950/15 border-l-2 border-l-cyber-cyan'}
                        `}
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center gap-1.5">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {!inq.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shrink-0 animate-pulse" title="Unread Message" />
                              )}
                              <span className="font-bold text-cyber-cyan truncate text-[10px]">
                                {inq.name}
                              </span>
                              <span className="text-[9px] text-cyber-slate truncate max-w-[120px] hidden sm:inline">
                                &lt;{inq.email}&gt;
                              </span>
                            </div>
                            <span className="text-[9px] text-cyber-slate font-mono shrink-0">
                              {new Date(inq.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-cyber-text text-[10px] mt-1 pl-2 border-l border-cyber-border/30 break-words italic leading-relaxed">
                            "{inq.message}"
                          </p>
                        </div>

                        {/* Interactive actions (Star, Read check, Delete) */}
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <button
                            onClick={() => handleToggleStar(inq.id)}
                            title={inq.is_starred ? "Mark as Not Important" : "Mark as Important"}
                            className={`p-1 rounded transition-all hover:bg-slate-800 ${
                              inq.is_starred ? 'text-cyber-amber' : 'text-cyber-slate hover:text-cyber-amber'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${inq.is_starred ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => handleToggleRead(inq.id)}
                            title={inq.is_read ? "Mark as Unread" : "Mark as Read"}
                            className={`p-1 rounded transition-all hover:bg-slate-800 ${
                              inq.is_read ? 'text-cyber-slate hover:text-cyber-cyan' : 'text-cyber-cyan'
                            }`}
                          >
                            {inq.is_read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            title="Delete Inquiry"
                            className="p-1 rounded text-cyber-slate hover:text-cyber-rose hover:bg-cyber-rose/5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-cyber-slate py-8 text-xs font-mono">
                      No customer inquiries received yet.
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
