import { useState } from 'react';
import { Doctor, Visit, UserRole } from '../types';
import { Calendar as CalendarIcon, Clock, Sparkles, MapPin, User, ChevronLeft, ChevronRight, CheckCircle2, UserCheck, Play } from 'lucide-react';

interface MonthlyPlannerProps {
  doctors: Doctor[];
  visits: Visit[];
  activeRole: UserRole;
  onRefresh: () => void;
  onTriggerAutoPlan: () => Promise<void>;
  onAddVisit: (visit: Omit<Visit, 'id'>) => Promise<void>;
}

export default function MonthlyPlanner({
  doctors,
  visits,
  activeRole,
  onRefresh,
  onTriggerAutoPlan,
  onAddVisit,
}: MonthlyPlannerProps) {
  const [currentYear, setCurrentYear] = useState(2026);
  // Default to June (index 5)
  const [currentMonth, setCurrentMonth] = useState(5);
  const [selectedDay, setSelectedDay] = useState<number | null>(19); // Default to June 19, 2026 (today)
  const [isGenerating, setIsGenerating] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Filter visits for active month
  const monthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  const handleAutoPlanExecution = async () => {
    setIsGenerating(true);
    try {
      await onTriggerAutoPlan();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const getVisitsForDay = (day: number) => {
    const dateStr = `${monthString}-${String(day).padStart(2, '0')}`;
    return visits.filter((v) => v.plannedDate === dateStr);
  };

  const getDayLabel = (day: number) => {
    const dates = new Date(currentYear, currentMonth, day);
    const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return labels[dates.getDay()];
  };

  const activeDayVisits = selectedDay ? getVisitsForDay(selectedDay) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. CALENDAR BOX */}
      <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 mb-5 gap-3">
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Monthly Territory Smart Planner
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-wider font-semibold">
                Visualizing physical coverage schedules, scheduling constraints, and compliance counts.
              </p>
            </div>

            {activeRole === 'Admin' && (
              <button
                onClick={handleAutoPlanExecution}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4.5 py-3 text-[10px] uppercase font-mono font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-nowrap self-start sm:self-auto shadow-lg shadow-blue-500/10"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    Solving Constraints...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Auto-Plan Gaps ({currentYear === 2026 && currentMonth === 5 ? 'Rest of Month' : 'Fill Slots'})
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase font-mono font-black tracking-wider text-slate-100 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-850">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((cur) => cur - 1);
                  } else {
                    setCurrentMonth((cur) => cur - 1);
                  }
                  setSelectedDay(null);
                }}
                className="p-1 px-2.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((cur) => cur + 1);
                  } else {
                    setCurrentMonth((cur) => cur + 1);
                  }
                  setSelectedDay(null);
                }}
                className="p-1 px-2.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* CALENDAR GRID ROUTE */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] uppercase font-mono font-black text-slate-500 mb-3 border-b border-slate-800 pb-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2.5">
            {paddingArray.map((p) => (
              <div key={`pad-${p}`} className="aspect-square bg-slate-950/20 rounded-xl border border-transparent" />
            ))}

            {daysArray.map((day) => {
              const dVisits = getVisitsForDay(day);
              const completedVisits = dVisits.filter((v) => v.status === 'Completed');
              const pendingVisits = dVisits.filter((v) => v.status === 'Planned');
              const hasMissed = dVisits.some((v) => v.status === 'Missed' || v.status === 'Doctor Unavailable');
              const isToday = day === 19 && currentYear === 2026 && currentMonth === 5;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  id={`calendar-day-${day}`}
                  className={`aspect-square p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : isToday
                      ? 'border-slate-700 bg-slate-950/50 ring-2 ring-blue-500/30'
                      : 'border-slate-850 hover:border-slate-800 bg-slate-950/30'
                  }`}
                >
                  <span className={`text-xs font-black font-mono ${isToday || isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {day}
                  </span>

                  {dVisits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {completedVisits.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${completedVisits.length} Completed`} />
                      )}
                      {pendingVisits.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-blue-400" title={`${pendingVisits.length} Planned`} />
                      )}
                      {hasMissed && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Missed Visits reported" />
                      )}
                    </div>
                  )}

                  {isToday && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-black tracking-widest bg-blue-600 text-white px-1 leading-normal rounded uppercase">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* METRICS SUMMARY IN PLANNER FOOTER */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap gap-x-6 gap-y-2.5 text-[10px] font-mono font-black uppercase text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Completed visit calls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            <span>Planned future visits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span>Missed check-ins needing recovery</span>
          </div>
        </div>
      </div>

      {/* 2. DAY DETAILS EXPANSION DRAWER */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <h3 className="font-display font-black text-white flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3 uppercase tracking-tight text-base sm:text-lg">
          <CalendarIcon className="w-4.5 h-4.5 text-blue-500" />
          <span>Itinerary for: {selectedDay ? `${selectedDay} ${monthNames[currentMonth]} ${currentYear}` : 'Select a Day'}</span>
        </h3>

        {!selectedDay ? (
          <div className="text-center py-20 text-slate-500 text-xs font-mono uppercase tracking-widest leading-relaxed">
            Click on any calendar slot to inspect daily tasks, coordinates routing, and visit statuses.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs">
              <div>
                <span className="text-slate-550 font-mono uppercase text-[10px]">Day type:</span>{' '}
                <span className="font-black text-white uppercase ml-1">{getDayLabel(selectedDay)}</span>
              </div>
              <div className="font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg font-black border border-blue-500/20 text-[9px] uppercase tracking-wider">
                {activeDayVisits.length} Stops planned
              </div>
            </div>

            {/* LIST OF VISITS ON THIS DAY */}
            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
              {activeDayVisits.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-[10px] uppercase tracking-wider bg-slate-950 border border-slate-850 rounded-2xl font-mono">
                  No visits logged today.
                  {activeRole === 'Admin' && selectedDay >= 20 && (
                    <p className="text-[9px] text-slate-600 mt-2.5 px-3 uppercase tracking-normal leading-normal font-sans font-bold">
                      Use the "Auto-Plan" engine to automatically match doctor availability schedules and target frequencies.
                    </p>
                  )}
                </div>
              ) : (
                activeDayVisits.map((item) => {
                  const doc = doctors.find((d) => d.id === item.doctorId);
                  const isCompleted = item.status === 'Completed';
                  const isMissed = item.status === 'Missed' || item.status === 'Doctor Unavailable';

                  return (
                    <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 shadow-sm relative overflow-hidden">
                      {isCompleted ? (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
                      ) : isMissed ? (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                      ) : (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-500" />
                      )}

                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="font-display font-black text-white text-sm sm:text-base tracking-tight">
                            {doc?.name || 'Unnamed Doctor'}
                          </div>
                          <div className="text-[9px] text-blue-400 uppercase font-mono font-black tracking-widest mt-1">
                            {doc?.specialty} • {item.actualArrival ? `Checked in: ${item.actualArrival}` : 'Not checked-in'}
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded border ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : isMissed
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {doc?.address && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-350 mt-3 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate" title={doc.address}>{doc.address}</span>
                        </div>
                      )}

                      {doc?.visitTimings && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{doc.visitTimings}</span>
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-3 text-[10px] text-slate-400 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <strong className="text-slate-300">Notes:</strong> {item.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* MANUAL PLAN ADDITION SLIDER FOR MR */}
            {activeDayVisits.length < 5 && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 mt-5 text-xs shadow-md">
                <p className="font-mono font-black text-white uppercase tracking-wider mb-2.5 text-xs">Supplement Day Itinerary</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Select Available Doctor</label>
                    <select
                      id="manual-itinerary-select"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-semibold text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                      onChange={(e) => {
                        const dId = e.target.value;
                        if (!dId) return;
                        
                        const dateStr = `${monthString}-${String(selectedDay).padStart(2, '0')}`;
                        onAddVisit({
                          doctorId: dId,
                          plannedDate: dateStr,
                          status: 'Planned',
                          notes: 'Manually logged supplementary physical visit.'
                        }).then(() => onRefresh());
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled className="text-slate-500 font-sans">-- Pick doctor to add target --</option>
                      {doctors
                        .filter(d => !activeDayVisits.some(v => v.doctorId === d.id))
                        .map(d => (
                          <option key={d.id} value={d.id} className="text-slate-300 bg-slate-900 font-sans">
                            {d.name} ({d.specialty} • {d.category})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
