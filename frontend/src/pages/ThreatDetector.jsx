import React, { useState, useRef } from 'react'
import { Shield, Upload, Play, AlertTriangle, CheckCircle2, ShieldCheck, Database, FileText } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import GlassCard from '../components/GlassCard'
import CyberButton from '../components/CyberButton'
import { useAuth } from '../App'

export default function ThreatDetector() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState('');
  
  // Single inference flow state
  const [flowData, setFlowData] = useState({
    source_ip: '192.168.1.50',
    destination_ip: '45.12.98.5',
    protocol: 'TCP',
    packet_size: '450',
    packet_count: '24',
    duration: '4.5',
    bytes_sent: '10800',
    bytes_received: '16200',
    ports_scanned: '0',
    syn_flag_count: '0',
    urg_flag_count: '0',
    latency: '15'
  });
  
  const [singleResult, setSingleResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  const handleInputChange = (e) => {
    setFlowData({ ...flowData, [e.target.name]: e.target.value });
  };

  const handleSinglePredict = async (e) => {
    e.preventDefault();
    setLoadingSingle(true);
    setError('');
    setSingleResult(null);
    setBatchResult(null);
    
    try {
      const res = await fetch('/api/threats/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...flowData,
          user_id: user.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze network flow.');
      
      setSingleResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSingle(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoadingBatch(true);
    setError('');
    setSingleResult(null);
    setBatchResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);
    
    try {
      const res = await fetch('/api/threats/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process CSV file.');
      
      setBatchResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingBatch(false);
      // Reset input element value to allow re-uploads
      e.target.value = null;
    }
  };

  // Generate Sample CSV logic for Presentation grading
  const downloadSampleCSV = () => {
    const headers = "packet_size,packet_count,duration,bytes_sent,bytes_received,ports_scanned,syn_flag_count,urg_flag_count,latency,source_ip,destination_ip,protocol\n";
    const rows = [
      "120,4000,1.2,475000,5000,2,3800,0,12,185.220.101.5,10.0.0.5,TCP",      // DDoS Attack
      "950,85,12.5,65000,16000,12,1,2,145,198.51.100.22,10.0.0.12,TCP",       // Malware
      "220,12,6.4,2640,3960,0,0,0,18,192.168.1.105,8.8.8.8,UDP",               // Normal Traffic
      "180,450,85.2,81000,81000,240,45,1,110,45.82.22.14,10.0.0.42,TCP",       // Botnet Activity
      "450,4,0.8,1800,4200,0,0,0,22,104.244.42.1,192.168.1.42,TCP"              // Phishing / Normal
    ].join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'cybershield_test_traffic.csv');
    a.click();
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar activePage="detector" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight">AI Traffic Threat Analyzer</h2>
            <p className="text-xs text-cyber-slate mt-0.5">Evaluate threat vectors using manual inputs or batch telemetry files</p>
          </div>

          {error && (
            <div className="p-3 rounded bg-cyber-rose/10 border border-cyber-rose/25 text-cyber-rose text-xs flex items-center gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Left: Manual Form panel */}
            <GlassCard title="Single connection Flow Diagnostics" className="border border-cyber-border/40" delay={0.05}>
              <form onSubmit={handleSinglePredict} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Source IP Address</label>
                  <input type="text" name="source_ip" required value={flowData.source_ip} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Destination IP Address</label>
                  <input type="text" name="destination_ip" required value={flowData.destination_ip} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Protocol Header</label>
                  <select name="protocol" value={flowData.protocol} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors">
                    <option value="TCP">TCP (Transmission Control)</option>
                    <option value="UDP">UDP (User Datagram)</option>
                    <option value="ICMP">ICMP (Control Message)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Average Packet Size (Bytes)</label>
                  <input type="number" name="packet_size" required min="20" value={flowData.packet_size} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Packet Count (per/sec)</label>
                  <input type="number" name="packet_count" required min="1" value={flowData.packet_count} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Flow Duration (Seconds)</label>
                  <input type="number" step="0.001" name="duration" required min="0.001" value={flowData.duration} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Total Bytes Sent</label>
                  <input type="number" name="bytes_sent" required min="0" value={flowData.bytes_sent} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Total Bytes Received</label>
                  <input type="number" name="bytes_received" required min="0" value={flowData.bytes_received} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Ports Scanned (1-65535)</label>
                  <input type="number" name="ports_scanned" required min="0" max="65535" value={flowData.ports_scanned} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">SYN Flag Count (TCP Floods)</label>
                  <input type="number" name="syn_flag_count" required min="0" value={flowData.syn_flag_count} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">URG Flag Count</label>
                  <input type="number" name="urg_flag_count" required min="0" value={flowData.urg_flag_count} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-cyber-slate mb-1">Network Latency (ms)</label>
                  <input type="number" name="latency" required min="0" value={flowData.latency} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyber-border focus:border-cyber-cyan outline-none rounded p-2 text-xs text-cyber-text transition-colors" />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <CyberButton type="submit" variant="cyan" loading={loadingSingle} className="w-full flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Run AI Threat Evaluation
                  </CyberButton>
                </div>
              </form>
            </GlassCard>

            {/* Right: CSV Upload & Output Panel */}
            <div className="space-y-6">
              
              {/* Batch Upload card */}
              <GlassCard title="Batch Traffic CSV Dataset Assessment" className="border border-cyber-border/40" delay={0.1}>
                <div className="p-6 border-2 border-dashed border-cyber-border/40 rounded-lg hover:border-cyber-cyan/50 transition-all flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-3 rounded-full bg-cyber-cyan/10 text-cyber-cyan">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyber-text">Upload network log CSV dataset</span>
                    <p className="text-[10px] text-cyber-slate mt-1 max-w-[280px] leading-relaxed">Ensure columns correspond exactly to flow feature attributes</p>
                  </div>
                  
                  <div className="flex gap-3 mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      disabled={loadingBatch}
                    />
                    <CyberButton 
                      variant="slate" 
                      onClick={() => fileInputRef.current.click()} 
                      className="text-xs" 
                      loading={loadingBatch}
                    >
                      <Database className="w-4 h-4" /> Choose CSV File
                    </CyberButton>
                    
                    <CyberButton variant="cyan" onClick={downloadSampleCSV} className="text-xs py-2 px-3">
                      <FileText className="w-4 h-4" /> Sample CSV
                    </CyberButton>
                  </div>
                </div>
              </GlassCard>

              {/* Single prediction output panel */}
              {singleResult && (
                <GlassCard 
                  title="Inference Classification Result" 
                  className={`border transition-all ${
                    singleResult.threat.prediction === 'Normal Traffic' ? 'border-cyber-emerald/30 bg-cyber-emerald/5' : 'border-cyber-rose/30 bg-cyber-rose/5'
                  }`}
                  delay={0.15}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Predicted Class</div>
                      <div className={`text-xl font-bold flex items-center gap-2 ${
                        singleResult.threat.prediction === 'Normal Traffic' ? 'text-cyber-emerald' : 'text-cyber-rose'
                      }`}>
                        {singleResult.threat.prediction === 'Normal Traffic' ? (
                          <ShieldCheck className="w-6 h-6" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 animate-pulse" />
                        )}
                        {singleResult.threat.prediction}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate">Inference Risk Score</div>
                      <div className={`text-xl font-bold font-mono ${
                        singleResult.threat.prediction === 'Normal Traffic' ? 'text-cyber-emerald' : 'text-cyber-rose'
                      }`}>
                        {singleResult.threat.risk_score}%
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-cyber-border/30">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate mb-1">Mitigation Recommendations Engine</div>
                      <div className="space-y-1">
                        {singleResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="text-xs text-cyber-text flex items-start gap-1.5 leading-relaxed">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                              singleResult.threat.prediction === 'Normal Traffic' ? 'bg-cyber-emerald' : 'bg-cyber-rose'
                            }`} />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Batch prediction output panel */}
              {batchResult && (
                <GlassCard title="CSV Batch Processing Summary" className="border border-cyber-cyan/35 bg-cyan-950/10 text-left" delay={0.15}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b border-cyber-border/30 pb-3.5 mb-3.5">
                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-cyber-slate">Total Rows</div>
                      <div className="text-lg font-bold font-mono text-cyber-text mt-0.5">{batchResult.total_processed}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-cyber-slate">Safe Traffic</div>
                      <div className="text-lg font-bold font-mono text-cyber-emerald mt-0.5">{batchResult.normal_traffic}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-cyber-slate">High Alerts</div>
                      <div className="text-lg font-bold font-mono text-cyber-rose mt-0.5">{batchResult.high_severity}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-cyber-slate">Medium Alerts</div>
                      <div className="text-lg font-bold font-mono text-cyber-amber mt-0.5">{batchResult.medium_severity}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyber-slate mb-2 block">First 5 Predicted CSV Rows</span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="border-b border-cyber-border/20 text-cyber-slate text-[9px] uppercase font-bold">
                            <th className="pb-1.5">Source IP</th>
                            <th className="pb-1.5">Destination IP</th>
                            <th className="pb-1.5">Classification</th>
                            <th className="pb-1.5 text-right">Risk Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/10">
                          {batchResult.predictions.slice(0, 5).map((pred) => (
                            <tr key={pred.id} className={pred.prediction !== 'Normal Traffic' ? 'text-cyber-rose font-bold' : ''}>
                              <td className="py-1.5">{pred.source_ip}</td>
                              <td className="py-1.5">{pred.destination_ip}</td>
                              <td className="py-1.5">{pred.prediction}</td>
                              <td className="py-1.5 text-right">{pred.risk_score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
