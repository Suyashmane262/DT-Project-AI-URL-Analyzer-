
export interface ThreatAnalysis {
  url: string;
  isSafe: boolean;
  riskScore: number;
  threatLevel: 'Safe' | 'Suspicious' | 'Dangerous' | 'Critical';
  summary: string;
  checks: {
    ssl: { status: boolean; label: string };
    blacklist: { status: boolean; label: string };
    phishing: { status: boolean; label: string };
    domainAge: { status: boolean; label: string };
  };
  detectedThreatTypes: string[];
  warningMessage: string;
}

export interface ScanHistoryItem {
  id: string;
  url: string;
  riskScore: number;
  threatLevel: string;
  threatCount: number;
  timestamp: number;
}

export interface AppStats {
  scanned: number;
  threats: number;
  safe: number;
  dangerous: number;
}
