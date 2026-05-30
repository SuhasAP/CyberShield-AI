import React from 'react'
import { Shield, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../App'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel border-x-0 border-t-0 border-b border-cyber-border sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden text-cyber-slate hover:text-cyber-cyan transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-cyber-cyan cyber-pulse-cyan rounded-full p-0.5" />
          <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
            CYBERSHIELD AI
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* User Profile display card */}
          <div className="flex items-center gap-3 pl-3 border-l border-cyber-border">
            <div className="w-9 h-9 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-cyber-text leading-tight">
                {user.username}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'Admin' ? 'bg-cyber-rose' : 'bg-cyber-emerald'}`} />
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyber-slate">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded bg-cyber-rose/10 border border-cyber-rose/20 text-cyber-rose hover:bg-cyber-rose hover:text-white transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
