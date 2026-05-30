import React, { useState, useEffect } from 'react'
import { Search, Filter, ShieldCheck, AlertCircle, RefreshCw, FileText, Download, Edit3, Check, X, ShieldAlert } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'
import { useAuth } from '../App'

export default function ThreatHistory() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [threats, setThreats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [prediction, setPrediction] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  
  // Note inline editing
  const [editingId, setEditingId] = useState(null);
  const [tempNote, setTempNote] = useState('');
  
  // PDF Report Compilation state
  const [reportTitle, setReportTitle] = useState('');
  const [reports, setReports] = useState([]);
  const [compiling, setCompiling] = useState(false);

  const fetchThreats = async () => {
    setRefreshing(true);
    try {
      const url = `/api/threats/history?search=${search}&prediction=${prediction}&status=${status}&limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load history.");
      const data = await res.json();
      setThreats(data.threats);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports/history');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreats();
    fetchReports();
  }, [prediction, status, offset]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchThreats();
  };

  const handleResetFilters = () => {
    setSearch('');
    setPrediction('');
    setStatus('');
    setOffset(0);
  };

  const handleStatusChange = async (threatId, newStatus) => {
    try {
      const res = await fetch(`/api/threats/${threatId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, user_id: user.id })
      });
      if (res.ok) {
        setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditNote = (threat) => {
    setEditingId(threat.id);
    setTempNote(threat.notes || '');
  };

  const saveNote = async (threatId) => {
    try {
      const res = await fetch(`/api/threats/${threatId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: tempNote, user_id: user.id })
      });
      if (res.ok) {
        setThreats(prev => prev.map(t => t.id === threatId ? { ...t, notes: tempNote } : t));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompileReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    
    setCompiling(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          user_id: user.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compile report.');
      
      setReportTitle('');
      fetchReports();
      alert("Security PDF report generated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar activePage="history" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full overflow-hidden">
          
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight">Threat Logs & Security Reports</h2>
            <p className="text-xs text-cyber-slate mt-0.5 font-mono">Total Threats Indexed: {total}</p>
          </div>

          {/* Top layout grid: Filters (Left 3 cols) and PDF Compilation (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Filter controls */}
            <GlassCard className="lg:col-span-2 border border-cyber-border/40 text-left" delay={0.05}>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Search Identifier / IP</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-cyber-slate" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded pl-10 pr-4 py-2.5 text-xs text-cyber-text transition-colors"
                        placeholder="Search IP, protocol, status..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Prediction Vector</label>
                    <select
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
                    >
                      <option value="">All Vectors</option>
                      <option value="Normal Traffic">Normal Traffic</option>
                      <option value="Malware">Malware</option>
                      <option value="DDoS Attack">DDoS Attack</option>
                      <option value="Phishing Attack">Phishing Attack</option>
                      <option value="Botnet Activity">Botnet Activity</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-cyber-slate">Triage Status</label>
                    <div className="flex gap-2">
                      {['Unresolved', 'Investigating', 'Resolved'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(status === st ? '' : st)}
                          className={`
                            px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider font-bold transition-all border
                            ${status === st 
                              ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan' 
                              : 'bg-slate-950 border-cyber-border/40 text-cyber-slate hover:border-cyber-cyan/40'
                            }
                          `}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <CyberButton type="submit" variant="cyan" loading={refreshing} className="py-1.5 px-4 text-xs font-bold">
                      <RefreshCw className="w-3.5 h-3.5" /> Filter Log
                    </CyberButton>
                    <CyberButton variant="slate" onClick={handleResetFilters} className="py-1.5 px-4 text-xs font-bold">
                      Reset
                    </CyberButton>
                  </div>
                </div>
              </form>
            </GlassCard>

            {/* Compile PDF reports panel */}
            <GlassCard title="Compile Security PDF report" className="border border-cyber-border/40 text-left" delay={0.1}>
              <form onSubmit={handleCompileReport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Assessment Audit Title</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2.5 text-xs text-cyber-text transition-colors"
                    placeholder="Q2 Cybersecurity Assessment..."
                  />
                </div>

                <CyberButton type="submit" variant="emerald" loading={compiling} className="w-full text-xs font-bold py-2.5">
                  <FileText className="w-4 h-4" /> Compile & Sign PDF Report
                </CyberButton>
              </form>
            </GlassCard>

          </div>

          {/* Main Log tabular layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Tabular Threat Log (Left 2 cols) */}
            <GlassCard title="Security Telemetry Audit Log" className="lg:col-span-2 border border-cyber-border/40 overflow-hidden" delay={0.15}>
              <div className="overflow-x-auto -mx-5 -mb-5 px-5 pb-5">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-cyber-border/30 text-[10px] font-bold uppercase tracking-wider text-cyber-slate font-mono">
                      <th className="py-3">Timestamp</th>
                      <th className="py-3">IP Route (Src &rarr; Dest)</th>
                      <th className="py-3">Proto</th>
                      <th className="py-3">Prediction</th>
                      <th className="py-3">Risk</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/10 text-xs font-mono">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-cyber-slate">
                          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-cyber-cyan" />
                          <span>Loading threat logs...</span>
                        </td>
                      </tr>
                    ) : threats.length > 0 ? (
                      threats.map((threat) => {
                        const isDanger = threat.prediction !== 'Normal Traffic';
                        const isEditing = editingId === threat.id;
                        
                        return (
                          <tr key={threat.id} className={`hover:bg-slate-800/15 transition-all ${isDanger ? 'bg-cyber-rose/5' : ''}`}>
                            {/* Timestamp */}
                            <td className="py-3 text-cyber-slate font-medium text-[11px]">
                              {new Date(threat.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            
                            {/* IP Route */}
                            <td className="py-3">
                              <span className="font-bold text-cyber-text">{threat.source_ip}</span>
                              <span className="text-cyber-slate mx-1">&rarr;</span>
                              <span className="text-cyber-slate">{threat.destination_ip}</span>
                            </td>
                            
                            {/* Proto */}
                            <td className="py-3 text-cyber-slate">{threat.protocol}</td>
                            
                            {/* Prediction */}
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                threat.prediction === 'Normal Traffic' 
                                  ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald' 
                                  : 'bg-cyber-rose/10 border-cyber-rose/30 text-cyber-rose'
                              }`}>
                                {threat.prediction}
                              </span>
                            </td>
                            
                            {/* Risk score */}
                            <td className="py-3 font-bold font-mono">
                              <span className={isDanger ? 'text-cyber-rose' : 'text-cyber-emerald'}>
                                {threat.risk_score}%
                              </span>
                            </td>
                            
                            {/* Status controls */}
                            <td className="py-3">
                              {isDanger ? (
                                <select
                                  value={threat.status}
                                  onChange={(e) => handleStatusChange(threat.id, e.target.value)}
                                  className={`
                                    bg-slate-950 border rounded text-[10px] font-bold p-1 outline-none font-mono
                                    ${threat.status === 'Resolved' ? 'border-cyber-emerald text-cyber-emerald' : ''}
                                    ${threat.status === 'Investigating' ? 'border-cyber-amber text-cyber-amber' : ''}
                                    ${threat.status === 'Unresolved' ? 'border-cyber-rose text-cyber-rose' : ''}
                                  `}
                                >
                                  <option value="Unresolved">Unresolved</option>
                                  <option value="Investigating">Investigating</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              ) : (
                                <span className="text-cyber-emerald font-bold uppercase text-[10px] flex items-center gap-1 font-mono">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Checked
                                </span>
                              )}
                            </td>
                            
                            {/* Notes editing */}
                            <td className="py-3 max-w-[200px] truncate">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    className="bg-slate-950 border border-cyber-cyan outline-none rounded p-1 text-[11px] w-full"
                                  />
                                  <button onClick={() => saveNote(threat.id)} className="p-1 rounded bg-cyber-emerald/10 text-cyber-emerald">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="p-1 rounded bg-cyber-rose/10 text-cyber-rose">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-1 group">
                                  <span className="text-cyber-slate text-[11px] truncate italic">
                                    {threat.notes || 'No analyst notes.'}
                                  </span>
                                  {isDanger && (
                                    <button 
                                      onClick={() => startEditNote(threat)} 
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-cyber-cyan hover:text-white transition-opacity ml-1 shrink-0"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-cyber-slate">
                          No threat events matching filters found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Generated Reports list (Right 1 col) */}
            <GlassCard title="Security Assessment PDF History" className="border border-cyber-border/40 text-left" delay={0.2}>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="p-3 rounded border border-cyber-border/30 bg-slate-900/30 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <FileText className="w-5 h-5 text-cyber-cyan shrink-0 mt-0.5" />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-cyber-text truncate">{report.title}</div>
                          <div className="text-[9px] text-cyber-slate font-mono mt-0.5">
                            BY: {report.generated_by} | {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <a
                        href={`/api/reports/download/${report.file_path.split('/').pop()}`}
                        download
                        className="p-2 rounded bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan hover:text-white transition-all shrink-0"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-cyber-slate text-xs font-mono">
                    No compiled security reports found in history database.
                  </div>
                )}
              </div>
            </GlassCard>

          </div>

        </main>
      </div>
    </div>
  );
}
