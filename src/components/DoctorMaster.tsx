import React, { useState } from 'react';
import { Doctor, UserRole, DoctorCategory } from '../types';
import { Search, Plus, MapPin, Eye, BookOpen, Clock, Download, CheckSquare, Sparkles, FileSpreadsheet, Trash2, ArrowRight, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface DoctorMasterProps {
  doctors: Doctor[];
  activeRole: UserRole;
  onRefresh: () => void;
  onUpdateDoctor: (doc: Doctor) => Promise<void>;
  onAddDoctor: (doc: Omit<Doctor, 'id'>) => Promise<void>;
  onDeleteDoctor: (id: string) => Promise<void>;
  onBulkUpload: (list: any[]) => Promise<any>;
}

export default function DoctorMaster({
  doctors,
  activeRole,
  onRefresh,
  onUpdateDoctor,
  onAddDoctor,
  onDeleteDoctor,
  onBulkUpload,
}: DoctorMasterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states for new Doctor
  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: 'Cardiologist',
    territory: 'South Mumbai',
    zone: 'Mumbai Metro',
    category: 'Core' as DoctorCategory,
    desiredFrequency: 2,
    maxAllowedFrequency: 3,
    visitDays: ['Monday', 'Thursday'],
    visitTimings: '10:00 - 13:00',
    appointmentRequired: false,
    address: '',
    lat: 18.9400,
    lng: 72.8200,
  });

  // Sheets import simulator state
  const [sheetLink, setSheetLink] = useState('');
  const [rawPasteData, setRawPasteData] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const specialties = ['All', ...Array.from(new Set(doctors.map((d) => d.specialty)))];

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;

    await onAddDoctor(newDoc);
    setIsAddingNew(false);
    // Reset form
    setNewDoc({
      name: '',
      specialty: 'Cardiologist',
      territory: 'South Mumbai',
      zone: 'Mumbai Metro',
      category: 'Core',
      desiredFrequency: 2,
      maxAllowedFrequency: 3,
      visitDays: ['Monday', 'Thursday'],
      visitTimings: '10:00 - 13:00',
      appointmentRequired: false,
      address: '',
      lat: 18.9400,
      lng: 72.8200,
    });
  };

  const handleExportTemplate = () => {
    const headers = 'name,specialty,territory,zone,category,desiredFrequency,maxAllowedFrequency,visitDays,visitTimings,appointmentRequired,address,lat,lng\n';
    const sampleVal = 'Dr. Neil Tyson,Neurosurgeon,South Zone,Mumbai Central,Super Core,3,4,Monday;Wednesday,15:00 - 18:00,true,New OPD Suites,18.9452,72.8211\n';
    const blob = new Blob([headers + sampleVal], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'VistraAI_DoctorMaster_Template.csv');
    a.click();
  };

  const handleSimulatePaste = () => {
    const rawCSV = `Dr. Robert Chen,Cardiologist,South Zone,Mumbai South,Super Core,3,4,Monday;Wednesday;Friday,09:00 - 11:30,true,Bombay Hospital,18.9401,72.8273
Dr. Amy Vance,Oncologist,Bandra West,Mumbai West,Core,2,3,Tuesday;Thursday,10:00 - 12:30,false,Lilavati Annex,19.0513,72.8285
Dr. Rajesh Kumar,Neurologist,Central Zone,Mumbai Central,Super Core,3,4,Tuesday;Thursday,16:00 - 18:30,true,OPD Complex,19.0028,72.8427`;
    setRawPasteData(rawCSV);
    analyzePasteData(rawCSV);
  };

  const handSheetConnect = () => {
    if (!sheetLink.includes('docs.google.com/spreadsheets')) {
      alert('Please enter a valid Google Sheets sharing URL.');
      return;
    }
    // Simulate real Google Sheet connection fetching and data validation
    const sheetCSV = `Dr. Sunita Patel,Pediatrician,Bandra West,Mumbai West,Regular,1,2,Monday;Wednesday,11:00 - 13:00,false,Holy Family Hospital,19.0489,72.8312
Dr. Neha Gupte,Pulmonologist,Andheri East,Mumbai West,Core,2,2,Wednesday;Friday,10:00 - 12:30,false,S.V. Road Clinic,19.1245,72.8456`;
    setRawPasteData(sheetCSV);
    analyzePasteData(sheetCSV);
  };

  const analyzePasteData = (csv: string) => {
    const lines = csv.split('\n').filter(l => l.trim().length > 0);
    const parsed: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    lines.forEach((line, i) => {
      const parts = line.split(',');
      if (parts.length < 5) {
        errors.push(`Row ${i + 1}: Insufficient columns (must have at least name, specialty, territory, zone, category).`);
        return;
      }

      const name = parts[0]?.trim();
      const specialty = parts[1]?.trim();
      const territory = parts[2]?.trim();
      const zone = parts[3]?.trim();
      const category = parts[4]?.trim();
      const desiredFrequency = Number(parts[5]) || 1;
      const maxAllowedFrequency = Number(parts[6]) || 2;
      const visitDays = parts[7] ? parts[7].split(';') : ['Monday'];
      const visitTimings = parts[8] || '10:00 - 13:00';
      const appointmentRequired = parts[9]?.trim().toLowerCase() === 'true';
      const address = parts[10] || 'OPD Suites';
      const lat = Number(parts[11]) || 18.9400;
      const lng = Number(parts[12]) || 72.8200;

      // Duplicate Check against existing master
      const isDuplicate = doctors.some(d => d.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (isDuplicate) {
        warnings.push(`Row ${i + 1}: Pre-existing duplicate detected for "${name}". It will be ignored to prevent overlapping logs.`);
      }

      parsed.push({
        name,
        specialty,
        territory,
        zone,
        category,
        desiredFrequency,
        maxAllowedFrequency,
        visitDays,
        visitTimings,
        appointmentRequired,
        address,
        lat,
        lng,
        isDuplicate
      });
    });

    setImportPreview(parsed);
    setValidationErrors(errors);
    setDuplicateWarnings(warnings);
  };

  const triggerBulkImport = async () => {
    // filter duplicates out so we do clean import
    const cleanList = importPreview.filter(p => !p.isDuplicate);
    if (cleanList.length === 0) {
      alert('No new unique doctors left to import.');
      return;
    }

    await onBulkUpload(cleanList);
    setIsImportModalOpen(false);
    setImportPreview([]);
    setRawPasteData('');
    setSheetLink('');
    setValidationErrors([]);
    setDuplicateWarnings([]);
    onRefresh();
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;

    return matchesSearch && matchesSpecialty && matchesCategory;
  });

  const canEditMaster = activeRole === 'Admin' || activeRole === 'Area Manager';

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Doctor Master CRM
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-wider font-semibold">
            Maintain high-value medical practitioner listings, target frequencies, and availability slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            id="btn-import-sheet"
            className="flex items-center gap-2.5 px-4 py-3 text-[10px] uppercase font-mono font-black text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl transition duration-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            Excel / Sheet Integration
          </button>

          {canEditMaster ? (
            <button
              onClick={() => setIsAddingNew(true)}
              id="btn-add-doctor"
              className="flex items-center gap-2.5 px-4 py-3 text-[10px] uppercase font-mono font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" />
              Add Practitioner
            </button>
          ) : (
            <div className="text-[10px] text-amber-500 font-mono font-black uppercase tracking-wider px-3.5 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
              <AlertCircle className="w-4.5 h-4.5" />
              Read-only view
            </div>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by practitioner name, clinic address, custom keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="doctor-search"
            className="w-full pl-10 pr-4 py-3 text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-semibold text-slate-200"
          />
        </div>

        <div>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            id="filter-specialty"
            className="w-full px-4 py-3 text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-bold uppercase tracking-wider text-slate-300"
          >
            <option value="All">Specialty: All</option>
            {specialties.filter(s => s !== 'All').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="filter-category"
            className="w-full px-4 py-3 text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-bold uppercase tracking-wider text-slate-300"
          >
            <option value="All">Category: All</option>
            <option value="Super Core">Super Core (3x / month)</option>
            <option value="Core">Core (2x / month)</option>
            <option value="Regular">Regular (1x / month)</option>
          </select>
        </div>
      </div>

      {/* MAIN SPREADSHEET TABLE */}
      <div className="border border-slate-850 rounded-2xl overflow-hidden scrollbar-thin bg-slate-950/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/85 border-b border-slate-850 text-[9px] text-slate-400 font-mono uppercase tracking-widest">
              <th className="py-4 px-5">Name / Specialty</th>
              <th className="py-4 px-5">Tier Category</th>
              <th className="py-4 px-5">Frequency Targets</th>
              <th className="py-4 px-5">Availability Windows</th>
              <th className="py-4 px-5">Territory Area</th>
              <th className="py-4 px-5">Coordinates / GPS</th>
              {canEditMaster && <th className="py-4 px-5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan={canEditMaster ? 7 : 6} className="text-center py-12 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                  No matching registered doctor listings found. Try refining search filters.
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doc) => {
                const isSuperCore = doc.category === 'Super Core';
                const isCore = doc.category === 'Core';
                return (
                  <tr key={doc.id} className="hover:bg-slate-950/60 transition duration-150">
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-display font-black text-white text-base tracking-tight">{doc.name}</span>
                        <div className="text-[10px] text-blue-400 font-mono font-black uppercase mt-1 tracking-wider">{doc.specialty}</div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
                          isSuperCore
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                            : isCore
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                            : 'bg-slate-850 text-slate-350 border-slate-800'
                        }`}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px]">
                      <div>
                        TARGET: <span className="text-blue-400 font-black">{doc.desiredFrequency} visits</span>/MO
                      </div>
                      <div className="text-slate-500 mt-1 font-semibold uppercase text-[10px]">MAX CAP: {doc.maxAllowedFrequency}/MO</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-slate-100">{doc.visitDays.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 font-mono font-semibold uppercase tracking-tight">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{doc.visitTimings} {doc.appointmentRequired && ' (REQ. APPT)'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-205 font-bold">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {doc.territory}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title={doc.address}>
                        {doc.address}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-[10px] text-slate-500 font-semibold uppercase whitespace-nowrap">
                      <div>LAT: {doc.lat.toFixed(4)}</div>
                      <div className="mt-0.5">LNG: {doc.lng.toFixed(4)}</div>
                    </td>
                    {canEditMaster && (
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Confirm physical deletion of ${doc.name}? This will cascade-delete linked calendars.`)) {
                              onDeleteDoctor(doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EXCEL SHEET SYNC MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-4xl max-h-[85vh] overflow-y-auto text-white">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Spreadsheet & Google Sheets Dynamic Sync</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-[10px] font-black uppercase tracking-wider border border-slate-850 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition duration-150 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-xs text-blue-300 leading-relaxed font-semibold">
                Provide real-time sync mapping directly from your <strong>Google Sheet</strong> or paste clean tabular CSV records to perform validation checks and structural mapping tests.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* GOOGLE SHEETS LINK */}
                <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/60">
                  <h4 className="font-display font-black text-white text-xs flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Option A: Connect Google Sheet
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Paste google sheet sharing link..."
                      value={sheetLink}
                      onChange={(e) => setSheetLink(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-blue-500 text-slate-100 font-semibold"
                    />
                    <button
                      onClick={handSheetConnect}
                      className="w-full py-2.5 text-[10px] uppercase font-mono font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition cursor-pointer"
                    >
                      Retrieve Master Records
                    </button>
                  </div>
                </div>

                {/* PLAIN PASTE CSV */}
                <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/60">
                  <h4 className="font-display font-black text-white text-xs flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    Option B: CSV Tabular Paste
                  </h4>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Paste CSV: name,specialty,territory,zone,category,frequency,max_freq,days,timings,need_appt,address,lat,lng"
                      value={rawPasteData}
                      onChange={(e) => {
                        setRawPasteData(e.target.value);
                        analyzePasteData(e.target.value);
                       }}
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono text-slate-100"
                    />
                    <div className="flex justify-between items-center flex-wrap gap-2 pt-1">
                      <button
                        onClick={handleSimulatePaste}
                        className="text-[10px] uppercase font-sans font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                      >
                        Load realistic territory CSV snippet
                      </button>
                      <button
                        onClick={() => handleExportTemplate()}
                        className="text-[10px] font-mono font-black uppercase text-slate-400 flex items-center gap-1.5 border border-slate-800 px-2.5 py-1 rounded-lg hover:text-white hover:bg-slate-850 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Get CSV Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DYNAMIC ERROR VALIDATION LOGS */}
              {(validationErrors.length > 0 || duplicateWarnings.length > 0) && (
                <div className="bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-850">
                  <h5 className="font-mono font-black text-[10px] text-slate-400 uppercase tracking-wider mb-2.5">Import Diagnostics & Duplicate Detection</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed">
                    {validationErrors.map((err, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-rose-450">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{err}</span>
                      </div>
                    ))}
                    {duplicateWarnings.map((war, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-amber-450">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>{war}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PREVIEW CONTAINER */}
              {importPreview.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-display font-black text-white text-xs mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    Parser mapped records preview ({importPreview.filter(p => !p.isDuplicate).length} New, {importPreview.filter(p => p.isDuplicate).length} Duplicate)
                  </h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden max-h-60 overflow-y-auto bg-slate-950/50">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 font-mono uppercase text-slate-400 text-[9px] tracking-wider border-b border-slate-850">
                        <tr>
                          <th className="p-3">Practitioner Name</th>
                          <th className="p-3">Specialty</th>
                          <th className="p-3">Zone Mapping</th>
                          <th className="p-3 text-center">Freq (Visits/mo)</th>
                          <th className="p-3">Weekly Days</th>
                          <th className="p-3">Status check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {importPreview.map((item, idx) => (
                          <tr key={idx} className={item.isDuplicate ? 'bg-amber-500/5 text-slate-500' : 'hover:bg-slate-900/40'}>
                            <td className="p-3 font-semibold text-slate-200">{item.name}</td>
                            <td className="p-3">{item.specialty}</td>
                            <td className="p-3">{item.zone} ({item.territory})</td>
                            <td className="p-3 text-center font-bold font-mono text-blue-400">{item.desiredFrequency}</td>
                            <td className="p-3">{item.visitDays.join(';')}</td>
                            <td className="p-3">
                              {item.isDuplicate ? (
                                <span className="text-[9px] uppercase font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Duplicate</span>
                              ) : (
                                <span className="text-[9px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportPreview([]);
                  }}
                  className="px-4.5 py-2.5 text-[10px] uppercase font-mono font-black text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerBulkImport}
                  disabled={importPreview.length === 0}
                  className="px-4.5 py-2.5 text-[10px] uppercase font-mono font-black bg-blue-600 disabled:opacity-30 disabled:hover:bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  Import verified listings ({importPreview.filter(p => !p.isDuplicate).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DOCTOR ADDITION MODAL FORM */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 text-white shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-black text-white text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
                <Plus className="w-5 h-5 text-blue-500" /> REGISTER NEW MEDICAL PRACTITIONER
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white font-black text-sm w-7 h-7 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Adams"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Specialty</label>
                  <select
                    value={newDoc.specialty}
                    onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold uppercase tracking-wider text-slate-300"
                  >
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Rheumatologist">Rheumatologist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Tier Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DoctorCategory })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold uppercase tracking-wider text-slate-300"
                  >
                    <option value="Super Core">Super Core (3x / month)</option>
                    <option value="Core">Core (2x / month)</option>
                    <option value="Regular">Regular (1x / month)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Territory Sub-Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Colaba, South Zone"
                    value={newDoc.territory}
                    onChange={(e) => setNewDoc({ ...newDoc, territory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Zone Hub</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai South"
                    value={newDoc.zone}
                    onChange={(e) => setNewDoc({ ...newDoc, zone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Target Frequency (visits/month)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newDoc.desiredFrequency}
                    onChange={(e) => setNewDoc({ ...newDoc, desiredFrequency: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Appointment Requirement</label>
                  <div className="flex items-center gap-2 mt-2.5">
                    <input
                      type="checkbox"
                      checked={newDoc.appointmentRequired}
                      onChange={(e) => setNewDoc({ ...newDoc, appointmentRequired: e.target.checked })}
                      className="rounded border border-slate-800 bg-slate-950 text-blue-500 w-4.5 h-4.5 cursor-pointer accent-blue-600"
                    />
                    <span className="text-slate-350 font-bold font-sans">Prior appointment required</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-mono font-black mb-1.5 uppercase tracking-widest text-[9px]">Consulting Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street details, clinic hospital wing..."
                  value={newDoc.address}
                  onChange={(e) => setNewDoc({ ...newDoc, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4.5 py-2.5 text-[10px] uppercase font-mono font-black text-slate-400 hover:text-white border border-slate-805 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 text-[10px] uppercase font-mono font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
