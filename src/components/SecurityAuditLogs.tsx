import { AuditLog } from '../types';
import { Shield, Lock, FileText, CheckCircle, Smartphone, AlertOctagon } from 'lucide-react';

interface SecurityAuditLogsProps {
  logs: AuditLog[];
}

export default function SecurityAuditLogs({ logs }: SecurityAuditLogsProps) {
  return (
    <div className="space-y-6 text-slate-300">
      {/* 1. ENTERPRISE COLD HARD SECURITY BLUEPRINT */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <h3 className="font-display font-black text-white text-base sm:text-lg flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3 uppercase tracking-tight">
          <Shield className="w-5 h-5 text-blue-500" />
          Vistra AI Enterprise Security Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4.5 bg-slate-950/60 rounded-2xl border border-slate-850">
            <span className="font-mono font-black text-blue-400 block mb-1.5 uppercase tracking-wider text-[10px]">Identity & Authentication</span>
            <p className="text-slate-400 leading-relaxed font-sans">
              Auth0 Single Sign-On (SSO) readiness with SAML 2.0 / OIDC integrations. Mandatory Multi-Factor Authentication (MFA) via SMS OTP or TOTP tokens.
            </p>
          </div>

          <div className="p-4.5 bg-slate-950/60 rounded-2xl border border-slate-850">
            <span className="font-mono font-black text-blue-400 block mb-1.5 uppercase tracking-wider text-[10px]">Healthcare Data Protection</span>
            <p className="text-slate-400 leading-relaxed font-sans">
              PII data values (practitioner details) encrypted at rest using industry-grade AES-256 and in transit using secure TLS 1.3 tunnels.
            </p>
          </div>

          <div className="p-4.5 bg-slate-950/60 rounded-2xl border border-slate-850">
            <span className="font-mono font-black text-blue-400 block mb-1.5 uppercase tracking-wider text-[10px]">Least Privilege & RBAC</span>
            <p className="text-slate-400 leading-relaxed font-sans">
              Zonal firewalls ensure field agents only inspect assigned coordinates listings. Zonal supervisors require dual-signed access requests to override territories.
            </p>
          </div>
        </div>
      </div>

      {/* 2. REALTIME AUDIT LOG TRAIL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-5 gap-3.5">
          <div>
            <h3 className="font-display font-black text-white text-base flex items-center gap-2 uppercase tracking-tight">
              <FileText className="w-4 h-4 text-blue-500" />
              Comprehensive Security Audit Journal
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold font-mono uppercase tracking-widest">
              Permanently recorded data actions, scheduling optimizations, and platform logins.
            </p>
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-950 rounded-lg text-slate-300 border border-slate-800 self-start sm:self-auto">
            {logs.length} logged traces
          </span>
        </div>

        <div className="border border-slate-850 rounded-2xl overflow-hidden font-mono text-[11px] bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/80 border-b border-slate-850 text-slate-450 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp / Date</th>
                <th className="p-3.5">Operator Identity</th>
                <th className="p-3.5">Action Mapped</th>
                <th className="p-3.5">Details / Diagnostics</th>
                <th className="p-3.5 text-right">Log Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 font-mono text-xs uppercase tracking-wider">
                    No active audit trail journals found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition duration-150">
                    <td className="p-3.5 truncate max-w-40">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-semibold text-slate-100">{log.userEmail}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-black text-blue-400 text-[10px] uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">{log.details}</td>
                    <td className="p-3.5 text-right text-slate-500 text-[10px] whitespace-nowrap font-bold">
                      {log.ipAddress} {log.geoTag && `• ${log.geoTag}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
