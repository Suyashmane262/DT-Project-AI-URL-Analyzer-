
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { analyzeUrl } from './services/geminiService';
import { ThreatAnalysis, ScanHistoryItem, AppStats } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ThreatAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [stats, setStats] = useState<AppStats>({ scanned: 0, threats: 0, safe: 0, dangerous: 0 });

  useEffect(() => {
    const savedHistory = localStorage.getItem('sentinel_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      
      const newStats = parsed.reduce((acc: AppStats, item: ScanHistoryItem) => ({
        scanned: acc.scanned + 1,
        threats: acc.threats + item.threatCount,
        safe: acc.safe + (item.riskScore < 40 ? 1 : 0),
        dangerous: acc.dangerous + (item.riskScore >= 40 ? 1 : 0),
      }), { scanned: 0, threats: 0, safe: 0, dangerous: 0 });
      setStats(newStats);
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) formattedUrl = 'https://' + url;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeUrl(formattedUrl);
      setResult(analysis);

      const newHistoryItem: ScanHistoryItem = {
        id: Date.now().toString(),
        url: analysis.url,
        riskScore: analysis.riskScore,
        threatLevel: analysis.threatLevel,
        threatCount: analysis.detectedThreatTypes.length,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('sentinel_history', JSON.stringify(updatedHistory));

      setStats(prev => ({
        scanned: prev.scanned + 1,
        threats: prev.threats + analysis.detectedThreatTypes.length,
        safe: prev.safe + (analysis.isSafe ? 1 : 0),
        dangerous: prev.dangerous + (!analysis.isSafe ? 1 : 0),
      }));
    } catch (err: any) {
      setError('ANALYSIS_CRITICAL_FAILURE: UNABLE TO CONNECT TO NEURAL CORE');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (level: string) => {
    switch(level) {
      case 'Safe': return 'text-emerald-500';
      case 'Suspicious': return 'text-amber-500';
      case 'Dangerous': return 'text-red-500';
      case 'Critical': return 'text-red-600';
      default: return 'text-slate-400';
    }
  };

  const getBadgeColor = (level: string) => {
    switch(level) {
      case 'Safe': return 'bg-emerald-500';
      case 'Suspicious': return 'bg-amber-500';
      case 'Dangerous': return 'bg-red-500';
      case 'Critical': return 'bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-10">
        <div className="mb-20 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] mono">
            Next-Gen Web Analysis Agent
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tighter text-white uppercase italic">
            Analyze <span className="text-purple-500 not-italic">Deep_Links</span>
          </h1>
          
          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-focus-within:opacity-75"></div>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="INPUT_URL_FOR_SCANNING..."
                className="w-full bg-[#0d0a21] border border-white/10 rounded-2xl py-6 px-8 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all shadow-2xl mono text-lg"
                disabled={isAnalyzing}
              />
              <button
                disabled={isAnalyzing || !url}
                className="absolute right-3 top-3 bottom-3 bg-purple-600 hover:bg-purple-500 text-white px-8 rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 cyber-btn"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning
                  </span>
                ) : 'Initiate_Scan'}
              </button>
            </div>
          </form>
          {error && <p className="mt-6 text-red-500 font-bold mono text-xs animate-pulse tracking-widest">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Results Column */}
          <div className="lg:col-span-8">
            {result ? (
              <div className="result-card p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
                  <div className="flex items-center gap-8">
                    <div className={`p-6 rounded-3xl ${result.isSafe ? 'bg-emerald-500' : 'bg-gradient-to-br from-red-600 to-red-800'} shadow-2xl relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {result.isSafe ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className={`text-4xl font-black uppercase italic tracking-tighter ${getStatusColor(result.threatLevel)}`}>
                          {result.threatLevel}
                        </h2>
                        <span className={`${getBadgeColor(result.threatLevel)} text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider`}>
                          {result.threatLevel}_RISK
                        </span>
                      </div>
                      <p className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${result.isSafe ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`}></span>
                         Intelligence Report: Status {result.isSafe ? 'CLEARED' : 'THREAT_IDENTIFIED'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk_Coefficient</div>
                    <div className={`text-3xl font-black ${getStatusColor(result.threatLevel)}`}>{result.riskScore}%</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-4 border border-slate-200 mb-10 overflow-hidden group">
                  <div className="bg-blue-600/10 p-2 rounded-lg text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <span className="text-blue-900 font-bold truncate mono text-sm group-hover:text-blue-600 transition-colors cursor-pointer">{result.url}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                  {Object.entries(result.checks).map(([key, check]) => (
                    <div key={key} className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex items-center justify-between hover:border-purple-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-slate-400">
                          {key === 'ssl' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                          {key === 'blacklist' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                          {key === 'phishing' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                          {key === 'domainAge' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                        </div>
                        <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{check.label}</span>
                      </div>
                      <div className={`p-1.5 rounded-xl ${check.status ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {check.status ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-slate-100 pt-10 mb-10">
                   <div className="flex items-center gap-3 mb-6 text-red-800 font-black uppercase tracking-tighter text-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Identified Vulnerabilities
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {result.detectedThreatTypes.length > 0 ? (
                      result.detectedThreatTypes.map((t, i) => (
                        <span key={i} className="bg-red-700 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest mono">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 font-bold mono text-sm">&gt; NO_CRITICAL_THREATS_DETECTED</span>
                    )}
                  </div>
                </div>

                {!result.isSafe && (
                  <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 text-red-900 flex items-start gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rotate-45 translate-x-16 -translate-y-16 opacity-50 transition-transform group-hover:scale-110"></div>
                    <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl relative z-10">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-black mb-2 uppercase tracking-tight text-xl italic">Security_Warning:</h4>
                      <p className="text-sm font-bold leading-relaxed text-red-800/80">{result.warningMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-purple-500/20 rounded-[3rem] p-24 bg-white/5 backdrop-blur-sm shadow-inner group">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <svg className="w-32 h-32 text-slate-700 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-9.53-7.014m12.912 2.147L16 11m0 0l3.536 3.536M16 11l-3.536 3.536" />
                  </svg>
                </div>
                <p className="text-2xl font-black uppercase tracking-widest text-slate-600 mono">Awaiting_Instructions</p>
                <p className="text-xs text-slate-700 mt-4 mono">&gt; IDLE: NEURAL_CORE_STANDBY</p>
              </div>
            )}
          </div>

          {/* Sidebars Column */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Detection Statistics Card */}
            <div className="cyber-card p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-2 h-8 bg-purple-600 rounded-full shadow-[0_0_10px_#7c3aed]"></div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white italic">Node_Statistics</h3>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Analyses', value: stats.scanned, color: 'bg-blue-500' },
                  { label: 'Critical_Hits', value: stats.threats, color: 'bg-red-500' },
                  { label: 'Safe_Exit', value: stats.safe, color: 'bg-emerald-500' },
                  { label: 'Danger_Zone', value: stats.dangerous, color: 'bg-orange-500' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] mono">
                      <span>{stat.label}</span>
                      <span className="text-white">{stat.value}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full ${stat.color} shadow-[0_0_15px_currentColor] transition-all duration-1000 ease-out`} 
                        style={{ width: `${stats.scanned > 0 ? (stat.value / stats.scanned) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Scans Card */}
            <div className="cyber-card p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]"></div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-white italic">Neural_History</h3>
              </div>
              <div className="space-y-5">
                {history.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all cursor-default group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-slate-300 truncate w-2/3 mono">{item.url}</span>
                      <span className={`${getBadgeColor(item.threatLevel)} text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter`}>
                        {item.threatLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mono">
                        T-{Math.floor((Date.now() - item.timestamp) / 60000)}m
                      </span>
                      <div className="flex items-center gap-2 text-purple-400">
                         <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                         <span className="text-[10px] font-black uppercase mono">{item.threatCount}_SIGNALS</span>
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center opacity-30">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mono">History_Empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 mt-40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          </div>
          <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] mono">
            End_of_Transmission // Sentinel_Core // 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
