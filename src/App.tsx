import { useState, useEffect } from 'react';
import { Doctor, Visit, RouteStop, TerritoryMetrics, AuditLog, UserRole } from './types';
import RoleSwitcher from './components/RoleSwitcher';
import DailyDashboard from './components/DailyDashboard';
import DoctorMaster from './components/DoctorMaster';
import MonthlyPlanner from './components/MonthlyPlanner';
import PredictiveIntelligence from './components/PredictiveIntelligence';
import AIAssistant from './components/AIAssistant';
import SecurityAuditLogs from './components/SecurityAuditLogs';
import { Shield, Sparkles, Navigation, Calendar, BookOpen, Clock, Activity, CloudSun, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'planner' | 'predictive' | 'ai' | 'security'>('dashboard');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [metrics, setMetrics] = useState<TerritoryMetrics | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('Medical Representative');
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Time metrics
  const [systemTime, setSystemTime] = useState('2026-06-19 05:54:40 (UTC)');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const docRes = await fetch('/api/doctors');
      const docsData = await docRes.json();
      setDoctors(docsData);

      const visitRes = await fetch('/api/visits');
      const visitsData = await visitRes.json();
      setVisits(visitsData);

      const metricsRes = await fetch('/api/metrics');
      const mData = await metricsRes.json();
      setMetrics(mData);

      const routeRes = await fetch('/api/routes/optimize');
      const rData = await routeRes.json();
      setRouteStops(rData);

      const logRes = await fetch('/api/audit-logs');
      const lData = await logRes.json();
      setAuditLogs(lData);
    } catch (err) {
      console.error('Fetch operations failed. Are you offline or in a test context?', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateVisitStatus = async (id: string, payload: Partial<Visit>) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDoctor = async (docPayload: Omit<Doctor, 'id'>) => {
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkUpload = async (docList: any[]) => {
    try {
      const res = await fetch('/api/doctors/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctors: docList, email: 'mbclicksphotos@gmail.com' }),
      });
      if (res.ok) {
        await fetchData();
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false, added: 0 };
  };

  const handleTriggerAutoPlan = async () => {
    try {
      const res = await fetch('/api/planner/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mbclicksphotos@gmail.com' }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVisit = async (visitPayload: Omit<Visit, 'id'>) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitPayload),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerRecovery = async (missedVisitId: string, recoverDate: string, notes?: string) => {
    try {
      const res = await fetch('/api/visits/reallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missedVisitId, recoverDate, notes, repEmail: 'mbclicksphotos@gmail.com' }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* GLOBAL HIGH-CONTRAST TOP BRANDING HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-6 px-6 sm:px-10 shadow-sm flex-shrink-0 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter text-white font-display">V</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none text-white font-display uppercase">
                  JUNE 19, 2026
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1.5">
                  Arjun Sharma • South Mumbai Territory • <span className="text-blue-500 font-black">Pharma CRM Pro v2.4</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* OFFLINE FIRST TOGGLE SIMULATOR */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              id="offline-toggle"
              className={`px-4 py-2 rounded-xl border font-black uppercase tracking-wider text-[10px] transition duration-200 cursor-pointer ${
                isOffline
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isOffline ? 'Offline Mode Active' : 'Cloud Sync Live'}</span>
            </button>

            {/* SYNC ACTIONS */}
            <button
              onClick={fetchData}
              id="refresh-btn"
              className="p-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition duration-200 cursor-pointer"
              title="Refresh Territory Datastore"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="text-slate-400 px-3 py-1.5 bg-slate-950/40 rounded-lg border border-slate-850">
              UTC Status: <span className="text-slate-200 font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* ROLE SWITHING CONTROL (RBAC DEMO) */}
        <RoleSwitcher activeRole={activeRole} onChangeRole={setActiveRole} />

        {/* COMPREHENSIVE TAB NAVIGATION */}
        <div className="border-b border-slate-800 flex overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            id="tab-dashboard"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-500" />
            Daily Dashboard
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            id="tab-crm"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'crm'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            Doctor CRM Master
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            id="tab-planner"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'planner'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            Monthly Planner
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            id="tab-predictive"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'predictive'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-500" />
            Predictive Analytics
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            id="tab-ai"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            AI Assistant
          </button>

          <button
            onClick={() => setActiveTab('security')}
            id="tab-security"
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-[0.2em] border-b-3 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-500" />
            Security Audit Logs
          </button>
        </div>

        {/* LOADING SHIM */}
        {isLoading && doctors.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-mono text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Loading Vistra database matrices...</span>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && metrics && (
              <DailyDashboard
                doctors={doctors}
                visits={visits}
                metrics={metrics}
                routeStops={routeStops}
                onRefresh={fetchData}
                onUpdateVisitStatus={handleUpdateVisitStatus}
                onTriggerRecovery={handleTriggerRecovery}
                onTriggerAutoPlan={handleTriggerAutoPlan}
              />
            )}

            {activeTab === 'crm' && (
              <DoctorMaster
                doctors={doctors}
                activeRole={activeRole}
                onRefresh={fetchData}
                onUpdateDoctor={async (doc) => {
                  await fetch(`/api/doctors/${doc.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc),
                  });
                  await fetchData();
                }}
                onAddDoctor={handleAddDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onBulkUpload={handleBulkUpload}
              />
            )}

            {activeTab === 'planner' && (
              <MonthlyPlanner
                doctors={doctors}
                visits={visits}
                activeRole={activeRole}
                onRefresh={fetchData}
                onTriggerAutoPlan={handleTriggerAutoPlan}
                onAddVisit={handleAddVisit}
              />
            )}

            {activeTab === 'predictive' && (
              <PredictiveIntelligence doctors={doctors} visits={visits} />
            )}

            {activeTab === 'ai' && <AIAssistant />}

            {activeTab === 'security' && <SecurityAuditLogs logs={auditLogs} />}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs mt-auto font-mono">
        <div className="max-w-7xl mx-auto px-6 space-y-1">
          <p>© 2026 Vistra AI Systems Inc. All clinical schedules compiled safely according to HIPAA directives.</p>
          <p className="text-slate-500">Connected Endpoint Port Status: 3000 • Production Cluster Ready • User: mbclicksphotos@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
