
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#030014]/80 backdrop-blur-xl border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-purple-600 p-2.5 rounded-xl border border-purple-400/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-white block leading-none">
              SENTINEL<span className="text-purple-500">_X</span>
            </span>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mono">Neural Defense System</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-10 text-xs font-bold uppercase tracking-widest text-slate-400 mono">
          <a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Scanner
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">Core_Docs</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Threat_DB</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4 mono text-[10px]">
            <span className="text-emerald-500">SYSTEM: ONLINE</span>
            <span className="text-slate-500">VERSION: 4.2.0-STABLE</span>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest mono transition-all">
            Access_Keys
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
