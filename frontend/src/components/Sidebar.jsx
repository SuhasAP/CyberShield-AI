import React from 'react'
import { LayoutDashboard, Radio, History, UserCog, ShieldAlert } from 'lucide-react'
import { useAuth } from '../App'

export default function Sidebar({ activePage, isOpen, onClose }) {
  const { user } = useAuth();
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      hash: '#/dashboard'
    },
    {
      id: 'detector',
      label: 'Threat Detector',
      icon: Radio,
      hash: '#/detector'
    },
    {
      id: 'history',
      label: 'Threat Logs',
      icon: History,
      hash: '#/history'
    },
    {
      id: 'profile',
      label: 'Security Settings',
      icon: UserCog,
      hash: '#/profile'
    }
  ];

  const sidebarClasses = `
    w-64 h-[calc(100vh-73px)] glass-panel border-y-0 border-l-0 border-r border-cyber-border
    fixed md:sticky top-[73px] z-30 transition-all duration-300 ease-in-out
    ${isOpen ? 'left-0' : '-left-64 md:left-0'}
  `;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 top-[73px] bg-black/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="p-4 flex flex-col h-full justify-between">
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold tracking-widest text-cyber-slate uppercase px-3 mb-3">
              Security Navigation
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <a
                  key={item.id}
                  href={item.hash}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300
                    ${isActive 
                      ? 'bg-cyber-cyan/15 text-cyber-cyan border-l-2 border-cyber-cyan shadow-cyber-cyan shadow-inner' 
                      : 'text-cyber-slate hover:bg-slate-800/40 hover:text-cyber-text'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-cyber-slate'}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>
          
          <div className="glass-panel rounded-lg p-3.5 border border-cyber-border/40">
            <div className="flex items-center gap-2 text-cyber-rose">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                System Status
              </span>
            </div>
            <div className="text-[10px] text-cyber-slate mt-1.5 leading-relaxed font-mono">
              IP: {window.location.hostname}<br />
              Node: Healthy<br />
              Security Shield: Active
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
