import { useState, useEffect } from 'react';
import { Doctor, Visit, RouteStop, TerritoryMetrics } from '../types';
import { Play, Check, X, AlertTriangle, Sparkles, Navigation, MapPin, Calendar, Clock, RotateCcw, AlertCircle, TrendingUp, CheckSquare, ChevronRight, CornerRightDown } from 'lucide-react';

interface DailyDashboardProps {
  doctors: Doctor[];
  visits: Visit[];
  metrics: TerritoryMetrics;
  routeStops: RouteStop[];
  onRefresh: () => void;
  onUpdateVisitStatus: (id: string, payload: Partial<Visit>) => Promise<void>;
  onTriggerRecovery: (missedId: string, recoverDate: string, notes?: string) => Promise<void>;
  onTriggerAutoPlan: () => Promise<void>;
}

export default function DailyDashboard({
  doctors,
  visits,
  metrics,
  routeStops,
  onRefresh,
  onUpdateVisitStatus,
  onTriggerRecovery,
  onTriggerAutoPlan,
}: DailyDashboardProps) {
  const [activeCheckInStop, setActiveCheckInStop] = useState<RouteStop | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isRecovering, setIsRecovering] = useState<string | null>(null); // visit ID
  const [selectedRecoveryDate, setSelectedRecoveryDate] = useState('2026-06-23');

  // Select missed visits for recover view
  const missedVisits = visits.filter(
    (v) =>
      v.plannedDate < '2026-06-20' &&
      (v.status === 'Missed' || v.status === 'Doctor Unavailable' || v.status === 'Clinic Closed') &&
      !v.rescheduledToId
  );

  // Suggested recovery recommendations
  const recommendedRecoveryNotes: Record<string, string> = {
    'v-5': 'Heavy rain delay backlog. Reallocate to Monday morning slot (June 22) - Dr. Sarah Adams.',
    'v-11': 'Dr. Kumar emergency call cancellation. Recovery opportunity detected Thursday afternoon (June 25).'
  };

  const handleStatusSubmit = async (status: 'Completed' | 'Missed' | 'Doctor Unavailable' | 'Clinic Closed' | 'Rescheduled') => {
    if (!activeCheckInStop) return;

    const payload: Partial<Visit> = {
      status,
      notes: `${checkInNotes} [Log recorded near clinic gps coordinates]`,
    };

    if (status === 'Completed') {
      const hhmm = new Date().toTimeString().split(' ')[0].substring(0, 5);
      payload.actualArrival = hhmm;
    } else {
      payload.missedReason = status === 'Doctor Unavailable' ? 'Doctor Unavailable' : 'Representative Delayed';
    }

    try {
      await onUpdateVisitStatus(activeCheckInStop.visitId, payload);
      setActiveCheckInStop(null);
      setCheckInNotes('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecoverySubmit = async (missedId: string) => {
    try {
      await onTriggerRecovery(missedId, selectedRecoveryDate, recommendedRecoveryNotes[missedId] || 'Manual recovery reallocation.');
      setIsRecovering(null);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Compute calculated values
  const activeStops = routeStops;
  const completedStops = activeStops.filter(s => s.status === 'Completed').length;
  const missedStops = activeStops.filter(s => s.status === 'Missed' || s.status === 'Doctor Unavailable').length;
  const pendingStops = activeStops.filter(s => s.status === 'Planned').length;

  return (
    <div className="space-y-6">
      {/* 1. TOP SNAPSHOT CARD HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SNAPSHOT CARD 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 flex flex-col justify-between min-h-[220px] shadow-lg">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 font-mono">Achievement Quota</div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-6xl sm:text-7xl font-black text-blue-500 font-display tracking-tighter leading-none">{metrics.completed}</span>
            <span className="text-slate-400 font-display text-lg font-bold">/ {metrics.totalVisitsRequired} visits</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.achievementRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-mono mt-2 text-slate-400 tracking-wider">
              <span className="font-bold">{metrics.achievementRate}% completed</span>
              <span className="text-emerald-400 font-black">{metrics.daysRemaining} days left</span>
            </div>
          </div>
        </div>

        {/* SNAPSHOT CARD 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 flex flex-col justify-between min-h-[220px] shadow-lg">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 font-mono">Completed / Missed</div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-5xl font-black text-emerald-450 font-display tracking-tight leading-none text-emerald-405">{metrics.completed}</div>
              <span className="text-[9px] text-slate-450 font-mono uppercase tracking-widest font-black block mt-2">Completed Calls</span>
            </div>
            <div className="h-12 w-[1px] bg-slate-800 animate-pulse" />
            <div>
              <div className="text-5xl font-black text-amber-500 font-display tracking-tight leading-none">{metrics.missed}</div>
              <span className="text-[9px] text-slate-450 font-mono uppercase tracking-widest font-black block mt-2">Cancellations</span>
            </div>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider border-t border-slate-800 pt-4 mt-4">
            Avg SUCCESS rate: <span className="font-black text-indigo-400">82.4%</span>
          </div>
        </div>

        {/* SNAPSHOT CARD 3 */}
        <div className="bg-rose-500 text-slate-950 rounded-3xl p-6.5 flex flex-col justify-between min-h-[220px] shadow-xl border-none hover:scale-[1.01] transition-transform duration-200">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950/75 font-mono">Alert: Risk Detected</div>
          <div className="mt-3 text-2xl font-black leading-tight tracking-tight font-display text-slate-950">
            Reschedule Dr. Adams' missed visit before week validation.
          </div>
          <div className="text-[10px] font-mono uppercase font-black tracking-widest border-t border-slate-950/15 pt-3.5 flex justify-between items-center text-slate-950">
            <span>Success rate: 90%</span>
            <span className="bg-slate-950 text-rose-400 px-2 py-0.5 rounded font-black font-mono">AI: CRITICAL</span>
          </div>
        </div>

        {/* SNAPSHOT CARD 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 flex flex-col justify-between min-h-[220px] shadow-lg">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 font-mono">At-Risk Accounts</div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-6xl font-black text-rose-500 font-display tracking-tighter leading-none">
              {doctors.filter(d => d.category === 'Super Core' && !visits.some(v => v.doctorId === d.id && v.status === 'Completed')).length}
            </span>
            <span className="text-slate-404 text-xs font-black uppercase tracking-widest font-mono">Super Core</span>
          </div>
          <div className="text-xs text-slate-400 leading-normal border-t border-slate-800 pt-4 mt-4">
            Active: <span className="font-black text-slate-100">Dr. Rajesh Kumar</span> has pending slot restrictions.
          </div>
        </div>
      </div>

      {/* 2. MAIN MISSION CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: DAILY STOPS & SVG VECTOR ROUTE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 mb-5 gap-4">
              <div>
                <h3 className="font-display font-black text-2xl tracking-tighter text-white uppercase flex items-center gap-2.5">
                  <Navigation className="w-5 h-5 text-blue-500" />
                  Today's Optimized Mission Route
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  GPS-sequenced scheduling based on traveler parameters and traffic queues.
                </p>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl font-mono self-start sm:self-center">
                {completedStops} / {activeStops.length} Completed Stops
              </div>
            </div>

            {/* INTEGRATED SVG ROUTING VECTOR MAP */}
            <div className="bg-slate-950 rounded-xl p-5 mb-5 relative border border-slate-800 shadow-inner">
              <span className="absolute top-3 left-4 text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Territory GPS Tracking View — CST South India
              </span>

              <div className="h-44 relative flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer baseline path connecting stops */}
                  <path
                    d="M 50,80 Q 200,40 350,90 T 650,50"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.15)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Inner dynamic navigation dotted line */}
                  <path
                    d="M 50,80 Q 200,40 350,90 T 650,50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* SVG PLOTS */}
                <div className="absolute inset-0 flex justify-between items-center px-8 z-10">
                  {/* START REPS BASELINE NODE */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-[10px] text-slate-350 font-bold font-mono">
                      GO
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">Start CST</span>
                  </div>

                  {activeStops.map((stop, index) => {
                    const isDone = stop.status === 'Completed';
                    const isOver = stop.status === 'Missed' || stop.status === 'Doctor Unavailable';
                    return (
                      <div key={stop.visitId} className="flex flex-col items-center">
                        <button
                          onClick={() => setActiveCheckInStop(stop)}
                          id={`svg-stop-${stop.stopNumber}`}
                          className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition cursor-pointer hover:scale-105 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                              : isOver
                              ? 'bg-amber-500 border-amber-300 text-slate-950'
                              : 'bg-slate-800 border-slate-600 text-white'
                          }`}
                        >
                          <span className="text-xs font-bold font-mono leading-none">{stop.stopNumber}</span>
                          <span className="text-[8px] font-mono leading-none scale-90 opacity-90 mt-0.5">
                            {isDone ? 'OK' : isOver ? 'MISS' : 'WAIT'}
                          </span>
                        </button>
                        <span className="text-[10px] text-slate-300 font-bold mt-1.5 max-w-20 truncate text-center">
                          Dr. {stop.doctorName.split(' ')[1]}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">{stop.estimatedArrival} AM</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPREHENSIVE STOPS LIST */}
            <div className="space-y-3">
              {activeStops.length === 0 ? (
                <div className="text-center py-10 font-mono text-slate-400 text-xs">
                  No execution visits recorded for today. Please set up visits on active planner calendar.
                </div>
              ) : (
                activeStops.map((stop) => {
                  const isDone = stop.status === 'Completed';
                  const isCanceled = stop.status === 'Missed' || stop.status === 'Doctor Unavailable';

                  return (
                    <div
                      key={stop.visitId}
                      className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                        isDone
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : isCanceled
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-slate-850 hover:border-slate-800 bg-slate-950/40 text-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-black text-blue-400 flex-shrink-0 mt-0.5">
                          {stop.stopNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-black text-white text-base tracking-tight">{stop.doctorName}</span>
                            <span
                              className={`text-[9px] font-mono px-2.5 py-0.5 rounded font-black uppercase border ${
                                stop.category === 'Super Core'
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                                  : 'bg-slate-800 text-slate-350 border-slate-700'
                              }`}
                            >
                              {stop.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-1 font-semibold">
                            {stop.specialty} • ESTIMATED SLOT: <span className="text-blue-400 font-black">{stop.estimatedArrival} AM</span> {stop.appointmentRequired && '(APPT REG)'}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-2 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            {stop.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        {!isDone && !isCanceled ? (
                          <button
                            onClick={() => {
                              setActiveCheckInStop(stop);
                              setCheckInNotes('');
                            }}
                            id={`stop-checkin-${stop.stopNumber}`}
                            className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/15"
                          >
                            <Play className="w-3.5 h-3.5" /> Check-In GPS
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5 text-xs">
                            <span
                              className={`px-2.5 py-1 rounded font-mono text-[9px] font-black uppercase tracking-wider border ${
                                isDone 
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {stop.status}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('Re-plan / Reset visit back to Pending?')) {
                                  onUpdateVisitStatus(stop.visitId, { status: 'Planned', actualArrival: undefined });
                                }
                              }}
                              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition"
                              title="Reset status"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECOVERY ENGINE & PREDICTIVE LOGICS */}
        <div className="space-y-6">
          {/* A. MISSED VISIT RECOVERY ENGINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2 mb-3 border-b border-slate-800 pb-4">
              <RotateCcw className="w-5 h-5 text-blue-500 animate-[spin_8s_linear_infinite]" />
              Missed Visit Recovery Engine
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed font-medium">
              Detects cancelled appointments and computes optimal recovery slots by checking future territory densities.
            </p>

            <div className="space-y-3.5">
              {missedVisits.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-slate-500 uppercase border border-slate-800 border-dashed rounded-lg">
                  Great! Zero missed visits pending recuperation.
                </div>
              ) : (
                missedVisits.map((v) => {
                  const doc = doctors.find((d) => d.id === v.doctorId);
                  const isBeingRescheduled = isRecovering === v.id;

                  return (
                    <div key={v.id} className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-200 text-xs sm:text-sm">
                            Dr. {doc?.name.split(' ').slice(1).join(' ') || 'Unknown'}
                          </div>
                          <span className="text-[10px] text-amber-400 font-mono">
                            Canceled on {v.plannedDate} ({v.missedReason})
                          </span>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 italic">
                        "Delayed due to weather backlogs on freeway."
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                        {!isBeingRescheduled ? (
                          <button
                            onClick={() => {
                              setIsRecovering(v.id);
                              // Suggest next optimal free weekday
                              setSelectedRecoveryDate('2026-06-25');
                            }}
                            className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.15em] text-white rounded-xl transition cursor-pointer shadow-md shadow-blue-500/10"
                          >
                            Suggest Recovery Opportunity
                          </button>
                        ) : (
                          <div className="space-y-3.5 text-xs">
                            <div>
                              <label className="block text-slate-500 mb-1.5 text-[9px] uppercase font-mono font-black tracking-widest">
                                AI Suggested recovery date
                              </label>
                              <select
                                value={selectedRecoveryDate}
                                onChange={(e) => setSelectedRecoveryDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono tracking-tight font-semibold"
                              >
                                <option value="2026-06-22">Monday June 22 (High Probability - 90%)</option>
                                <option value="2026-06-23">Tuesday June 23 (Normal Probability - 72%)</option>
                                <option value="2026-06-25">Thursday June 25 (Normal Probability - 81%)</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsRecovering(null)}
                                className="flex-1 py-2 text-[10px] uppercase font-mono font-black tracking-wider border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRecoverySubmit(v.id)}
                                className="flex-1 py-2 text-[10px] uppercase font-mono font-black tracking-wider bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950"
                              >
                                Apply Recovery
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* B. CATEGORY STATS CHART LIST */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl text-white">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Category Target Performance
            </h3>
            <div className="space-y-5">
              {/* SUPER CORE PROGRESS */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-350 uppercase tracking-wider text-[10px]">Super Core Target Status</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {metrics.byCategory['Super Core'].completed} / {metrics.byCategory['Super Core'].required} ({metrics.byCategory['Super Core'].rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${metrics.byCategory['Super Core'].rate}%` }}
                  />
                </div>
              </div>

              {/* CORE PROGRESS */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-350 uppercase tracking-wider text-[10px]">Core Target Status</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {metrics.byCategory['Core'].completed} / {metrics.byCategory['Core'].required} ({metrics.byCategory['Core'].rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${metrics.byCategory['Core'].rate}%` }}
                  />
                </div>
              </div>

              {/* REGULAR PROGRESS */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-350 uppercase tracking-wider text-[10px]">Regular Target Status</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {metrics.byCategory['Regular'].completed} / {metrics.byCategory['Regular'].required} ({metrics.byCategory['Regular'].rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-slate-700 h-full rounded-full"
                    style={{ width: `${metrics.byCategory['Regular'].rate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CHECK-IN CONSOLE POPUP MODAL */}
      {activeCheckInStop && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em] block">
                  Active field check-in console
                </span>
                <h4 className="font-display font-black text-white text-lg sm:text-xl mt-1 uppercase">
                  Dr. {activeCheckInStop.doctorName}
                </h4>
              </div>
              <button
                onClick={() => setActiveCheckInStop(null)}
                className="text-slate-400 hover:text-white font-black text-xl w-8 h-8 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-xs bg-slate-950 p-4 rounded-2xl border border-slate-850 leading-relaxed text-slate-300">
                <strong className="text-slate-400 uppercase tracking-wider text-[9px] font-mono block mb-1">Clinician Location Info</strong>
                <p className="flex items-center gap-1 font-bold">{activeCheckInStop.address}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-blue-400"><strong>Specialty Timing Slot:</strong> {activeCheckInStop.estimatedArrival} AM</p>
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-black mb-2 font-mono uppercase tracking-widest">
                  Visit Minutes / Details
                </label>
                <textarea
                  placeholder="Notes from clinical visit: product samples distributed, discussed core safety studies..."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-155 transition"
                  rows={3}
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleStatusSubmit('Completed')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Check className="w-4 h-4 text-slate-950" /> Record Call COMPLETED
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusSubmit('Doctor Unavailable')}
                    className="py-2.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 border border-amber-500/20 font-black uppercase tracking-wider text-[10px] rounded-xl transition cursor-pointer"
                  >
                    Dr. Unavailable
                  </button>
                  <button
                    onClick={() => handleStatusSubmit('Clinic Closed')}
                    className="py-2.5 bg-slate-950 text-slate-405 hover:bg-slate-800 border border-slate-800 font-black uppercase tracking-wider text-[10px] rounded-xl transition cursor-pointer"
                  >
                    Clinic Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
