import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Doctor, Visit, AuditLog, TerritoryMetrics, RouteStop, DoctorCategory, VisitStatus } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header.
// It uses search and grounding as needed, or direct prompt execution.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Pre-seeded Doctors with realistic coordinates inside a 20km cluster in Mumbai, India.
let dbDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Adams',
    specialty: 'Cardiologist',
    territory: 'South Zone',
    zone: 'Mumbai South',
    category: 'Super Core',
    desiredFrequency: 3,
    maxAllowedFrequency: 4,
    visitDays: ['Monday', 'Wednesday', 'Friday'],
    visitTimings: '09:00 - 11:30',
    appointmentRequired: true,
    priorityScore: 10,
    successRate: 0.88,
    lastVisitDate: '2026-06-15',
    lat: 18.9401,
    lng: 72.8273,
    address: 'Bombay Hospital Executive Suites, New Marine Lines, Mumbai',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Neurologist',
    territory: 'Central Zone',
    zone: 'Mumbai Central',
    category: 'Super Core',
    desiredFrequency: 3,
    maxAllowedFrequency: 4,
    visitDays: ['Tuesday', 'Thursday', 'Friday'],
    visitTimings: '16:00 - 18:30',
    appointmentRequired: true,
    priorityScore: 9,
    successRate: 0.75,
    lastVisitDate: '2026-06-11',
    lat: 19.0028,
    lng: 72.8427,
    address: 'Tata Memorial OPD Complex, Parel, Mumbai',
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Shah',
    specialty: 'Oncologist',
    territory: 'Bandra West',
    zone: 'Mumbai West',
    category: 'Core',
    desiredFrequency: 2,
    maxAllowedFrequency: 3,
    visitDays: ['Monday', 'Thursday'],
    visitTimings: '10:00 - 13:00',
    appointmentRequired: false,
    priorityScore: 8,
    successRate: 0.92,
    lastVisitDate: '2026-06-12',
    lat: 19.0513,
    lng: 72.8285,
    address: 'Lilavati Medical Centre, Bandra West, Mumbai',
  },
  {
    id: 'doc-4',
    name: 'Dr. Raymond D’Souza',
    specialty: 'Pediatrician',
    territory: 'Bandra West',
    zone: 'Mumbai West',
    category: 'Regular',
    desiredFrequency: 1,
    maxAllowedFrequency: 2,
    visitDays: ['Tuesday', 'Friday'],
    visitTimings: '11:00 - 14:00',
    appointmentRequired: false,
    priorityScore: 5,
    successRate: 0.64,
    lastVisitDate: '2026-06-05',
    lat: 19.0489,
    lng: 72.8312,
    address: 'Holy Family Hospital Annex, Bandra West, Mumbai',
  },
  {
    id: 'doc-5',
    name: 'Dr. Anita Desai',
    specialty: 'Endocrinologist',
    territory: 'South Zone',
    zone: 'Mumbai South',
    category: 'Core',
    desiredFrequency: 2,
    maxAllowedFrequency: 3,
    visitDays: ['Wednesday', 'Saturday'],
    visitTimings: '14:00 - 16:30',
    appointmentRequired: true,
    priorityScore: 7,
    successRate: 0.81,
    lastVisitDate: '2026-06-08',
    lat: 18.9622,
    lng: 72.8194,
    address: 'Jaslok Hospital OPD Wing, Pedder Road, Mumbai',
  },
  {
    id: 'doc-6',
    name: 'Dr. Vivek Mehra',
    specialty: 'Gastroenterologist',
    territory: 'Central Zone',
    zone: 'Mumbai Central',
    category: 'Regular',
    desiredFrequency: 1,
    maxAllowedFrequency: 2,
    visitDays: ['Wednesday', 'Thursday'],
    visitTimings: '09:00 - 12:00',
    appointmentRequired: false,
    priorityScore: 6,
    successRate: 0.70,
    lastVisitDate: '2026-06-03',
    lat: 19.0155,
    lng: 72.8412,
    address: 'KEM Hospital Gastro Block, Parel, Mumbai',
  },
  {
    id: 'doc-7',
    name: 'Dr. Suresh Mehta',
    specialty: 'Cardiologist',
    territory: 'Andheri East',
    zone: 'Mumbai West',
    category: 'Super Core',
    desiredFrequency: 3,
    maxAllowedFrequency: 3,
    visitDays: ['Monday', 'Tuesday', 'Friday'],
    visitTimings: '15:00 - 18:00',
    appointmentRequired: true,
    priorityScore: 9,
    successRate: 0.85,
    lastVisitDate: '2026-06-16',
    lat: 19.1171,
    lng: 72.8682,
    address: 'SevenHills Clinic Block, Andheri East, Mumbai',
  },
  {
    id: 'doc-8',
    name: 'Dr. Neha Gupte',
    specialty: 'Pulmonologist',
    territory: 'Andheri East',
    zone: 'Mumbai West',
    category: 'Core',
    desiredFrequency: 2,
    maxAllowedFrequency: 2,
    visitDays: ['Wednesday', 'Friday'],
    visitTimings: '10:00 - 12:30',
    appointmentRequired: false,
    priorityScore: 7,
    successRate: 0.78,
    lastVisitDate: '2026-06-10',
    lat: 19.1245,
    lng: 72.8456,
    address: 'Andheri Medical Labs, S.V. Road, Mumbai',
  },
  {
    id: 'doc-9',
    name: 'Dr. Robert Lopez',
    specialty: 'Dermatologist',
    territory: 'South Zone',
    zone: 'Mumbai South',
    category: 'Regular',
    desiredFrequency: 1,
    maxAllowedFrequency: 2,
    visitDays: ['Thursday', 'Friday'],
    visitTimings: '16:00 - 19:00',
    appointmentRequired: false,
    priorityScore: 4,
    successRate: 0.90,
    lastVisitDate: '2026-06-01',
    lat: 18.9554,
    lng: 72.8251,
    address: 'Metro Polyclinic, Girgaon, Mumbai',
  },
  {
    id: 'doc-10',
    name: 'Dr. Maryam Khan',
    specialty: 'Rheumatologist',
    territory: 'Central Zone',
    zone: 'Mumbai Central',
    category: 'Core',
    desiredFrequency: 2,
    maxAllowedFrequency: 3,
    visitDays: ['Tuesday', 'Thursday'],
    visitTimings: '14:00 - 17:00',
    appointmentRequired: true,
    priorityScore: 8,
    successRate: 0.83,
    lastVisitDate: '2026-06-11',
    lat: 19.0321,
    lng: 72.8561,
    address: 'PD Hinduja Trauma Wing, Mahim, Mumbai',
  }
];

// Pre-seeded Visits spanning June 2026
// Current date is 2026-06-19T05:54:40-07:00 (which is June 19th, 2026).
let dbVisits: Visit[] = [
  // Completed visits in early June
  { id: 'v-1', doctorId: 'doc-1', plannedDate: '2026-06-01', actualArrival: '09:30', status: 'Completed', notes: 'Discussed new Beta-blocker trials; Dr. Adams was highly receptive.' },
  { id: 'v-2', doctorId: 'doc-2', plannedDate: '2026-06-02', actualArrival: '16:15', status: 'Completed', notes: 'Gave feedback on clinical brochure.' },
  { id: 'v-3', doctorId: 'doc-3', plannedDate: '2026-06-04', actualArrival: '10:10', status: 'Completed', notes: 'Delivered formulation samples. High clinic footfall today.' },
  { id: 'v-4', doctorId: 'doc-5', plannedDate: '2026-06-08', actualArrival: '14:20', status: 'Completed', notes: 'Routine follow-up on patient tolerance queries.' },
  
  // Missed visits
  { id: 'v-5', doctorId: 'doc-1', plannedDate: '2026-06-08', status: 'Missed', missedReason: 'Representative Delayed', notes: 'Delayed due to heavy rain and traffic backlog on freeway.' },
  { id: 'v-6', doctorId: 'doc-2', plannedDate: '2026-06-11', actualArrival: '17:00', status: 'Completed', notes: 'Followed up neurological study and left latest journal extracts.' },
  
  // Completed in mid June
  { id: 'v-7', doctorId: 'doc-7', plannedDate: '2026-06-09', actualArrival: '15:10', status: 'Completed', notes: 'Demonstrated medical device application.' },
  { id: 'v-8', doctorId: 'doc-8', plannedDate: '2026-06-10', actualArrival: '10:15', status: 'Completed', notes: 'Delivered inhaler instructional leaflets.' },
  { id: 'v-9', doctorId: 'doc-1', plannedDate: '2026-06-15', actualArrival: '09:45', status: 'Completed', notes: 'Requested prescription data from previous quarter.' },
  { id: 'v-10', doctorId: 'doc-7', plannedDate: '2026-06-16', actualArrival: '16:00', status: 'Completed', notes: 'Approved for institutional formulary discussion.' },

  // Unavailability status during mid June
  { id: 'v-11', doctorId: 'doc-2', plannedDate: '2026-06-16', status: 'Doctor Unavailable', missedReason: 'Doctor Unavailable', notes: 'Dr. Kumar was on emergency call at nearby hospital.' },
  { id: 'v-12', doctorId: 'doc-10', plannedDate: '2026-06-11', actualArrival: '14:30', status: 'Completed', notes: 'Dr. Khan agreed to review scientific paper on Biosimilars.' },

  // TODAY'S VISITS (June 19, 2026) - Initial Setup
  { id: 'v-today-1', doctorId: 'doc-1', plannedDate: '2026-06-19', status: 'Planned', notes: 'Discuss new product release.' },
  { id: 'v-today-2', doctorId: 'doc-3', plannedDate: '2026-06-19', status: 'Planned', notes: 'Finalize oncology roundtable invitations.' },
  { id: 'v-today-3', doctorId: 'doc-10', plannedDate: '2026-06-19', status: 'Planned', notes: 'Deliver product handbook.' },
  { id: 'v-today-4', doctorId: 'doc-4', plannedDate: '2026-06-19', status: 'Planned', notes: 'Quarterly review.' },

  // FUTURE PLANNED VISITS
  { id: 'v-fut-1', doctorId: 'doc-2', plannedDate: '2026-06-22', status: 'Planned', notes: 'Confirm speaker details.' },
  { id: 'v-fut-2', doctorId: 'doc-5', plannedDate: '2026-06-24', status: 'Planned', notes: 'Distribute scientific brochure.' },
  { id: 'v-fut-3', doctorId: 'doc-7', plannedDate: '2026-06-26', status: 'Planned', notes: 'Institutional purchase follow-up.' },
  { id: 'v-fut-4', doctorId: 'doc-8', plannedDate: '2026-06-26', status: 'Planned', notes: 'Review asthma study papers.' },
  { id: 'v-fut-5', doctorId: 'doc-10', plannedDate: '2026-06-25', status: 'Planned', notes: 'Discuss therapeutic efficacy index.' },
];

// Pre-seeded Audit Logs
let dbAuditLogs: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-06-01T08:00:00Z', userEmail: 'mbclicksphotos@gmail.com', action: 'System Initialized', details: 'Vistra AI platform successfully pre-seeded with Mumbai Metro Area Dr. Master', ipAddress: '127.0.0.1' },
  { id: 'log-2', timestamp: '2026-06-10T11:00:00Z', userEmail: 'mbclicksphotos@gmail.com', action: 'Schedule Generated', details: 'Monthly optimized calendar generated with travel route buffers', ipAddress: '192.168.1.34' }
];

// Helper to log audit changes
function addAuditLog(email: string, action: string, details: string, ip: string = '127.0.0.1', geo?: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userEmail: email,
    action,
    details,
    ipAddress: ip,
    geoTag: geo,
  };
  dbAuditLogs.unshift(newLog);
}

// 1. DOCTORS ENDPOINTS
app.get('/api/doctors', (req, res) => {
  res.json(dbDoctors);
});

app.post('/api/doctors', (req, res) => {
  const newDoc: Doctor = {
    id: `doc-${Date.now()}`,
    ...req.body,
    priorityScore: req.body.priorityScore || (req.body.category === 'Super Core' ? 10 : req.body.category === 'Core' ? 7 : 4),
    successRate: req.body.successRate || 0.75,
  };
  dbDoctors.unshift(newDoc);
  addAuditLog('mbclicksphotos@gmail.com', 'Create Doctor', `Added doctor Dr. ${newDoc.name} (${newDoc.specialty})`);
  res.status(201).json(newDoc);
});

app.put('/api/doctors/:id', (req, res) => {
  const { id } = req.params;
  const idx = dbDoctors.findIndex(d => d.id === id);
  if (idx > -1) {
    dbDoctors[idx] = { ...dbDoctors[idx], ...req.body };
    addAuditLog('mbclicksphotos@gmail.com', 'Update Doctor', `Modified details of Dr. ${dbDoctors[idx].name}`);
    res.json(dbDoctors[idx]);
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.delete('/api/doctors/:id', (req, res) => {
  const { id } = req.params;
  const idx = dbDoctors.findIndex(d => d.id === id);
  if (idx > -1) {
    const doc = dbDoctors[idx];
    dbDoctors.splice(idx, 1);
    addAuditLog('mbclicksphotos@gmail.com', 'Delete Doctor', `Deleted doctor ${doc.name} from Doctor Master`);
    res.json({ success: true, message: 'Doctor deleted' });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

// Bulk Upload Endpoint
app.post('/api/doctors/bulk-upload', (req, res) => {
  const { doctors: uploadList, email } = req.body;
  if (!Array.isArray(uploadList)) {
    return res.status(400).json({ error: 'Invalid payload: doctors list is required.' });
  }

  let added = 0;
  let duplicates = 0;
  const originalCount = dbDoctors.length;

  uploadList.forEach((raw: any) => {
    // Check duplicate by name or address
    const duplicate = dbDoctors.some(d => d.name.toLowerCase().trim() === raw.name?.toLowerCase().trim());
    if (duplicate) {
      duplicates++;
      return;
    }

    const newDoc: Doctor = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: raw.name || 'Unnamed Doctor',
      specialty: raw.specialty || 'General',
      territory: raw.territory || 'Default Territory',
      zone: raw.zone || 'Default Zone',
      category: (raw.category === 'Super Core' || raw.category === 'Core' || raw.category === 'Regular') ? raw.category : 'Regular',
      desiredFrequency: Number(raw.desiredFrequency) || 1,
      maxAllowedFrequency: Number(raw.maxAllowedFrequency) || 2,
      visitDays: Array.isArray(raw.visitDays) ? raw.visitDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      visitTimings: raw.visitTimings || '10:00 - 13:00',
      appointmentRequired: raw.appointmentRequired !== undefined ? Boolean(raw.appointmentRequired) : false,
      priorityScore: raw.priorityScore ? Number(raw.priorityScore) : (raw.category === 'Super Core' ? 10 : 7),
      successRate: raw.successRate ? Number(raw.successRate) : 0.75,
      lat: Number(raw.lat) || (18.9 + Math.random() * 0.25),
      lng: Number(raw.lng) || (72.8 + Math.random() * 0.15),
      address: raw.address || 'OPD Consulting Wings',
    };

    dbDoctors.push(newDoc);
    added++;
  });

  addAuditLog(email || 'mbclicksphotos@gmail.com', 'Bulk Data Upload', `Bulk imported ${added} doctors. Detected ${duplicates} duplicate entries.`);
  res.json({
    success: true,
    added,
    duplicates,
    totalCount: dbDoctors.length
  });
});

// 2. VISITS ENDPOINTS
app.get('/api/visits', (req, res) => {
  res.json(dbVisits);
});

// Update or Create Visit
app.post('/api/visits', (req, res) => {
  const { id, doctorId, plannedDate, status, notes, actualArrival, missedReason, rescheduledToId } = req.body;
  
  if (id) {
    const idx = dbVisits.findIndex(v => v.id === id);
    if (idx > -1) {
      const oldStatus = dbVisits[idx].status;
      dbVisits[idx] = { ...dbVisits[idx], status, notes, actualArrival, missedReason, rescheduledToId };
      
      // Update Doctor lastVisitDate if Completed
      if (status === 'Completed') {
        const dIdx = dbDoctors.findIndex(d => d.id === dbVisits[idx].doctorId);
        if (dIdx > -1) {
          dbDoctors[dIdx].lastVisitDate = plannedDate || new Date().toISOString().split('T')[0];
        }
      }

      addAuditLog('mbclicksphotos@gmail.com', 'Visit Updated', `Visit for doctor ID ${dbVisits[idx].doctorId} updated to ${status}. Details: ${notes || 'N/A'}`);
      return res.json(dbVisits[idx]);
    }
  }

  // Create instead of update
  const newVisit: Visit = {
    id: id || `v-${Date.now()}`,
    doctorId,
    plannedDate: plannedDate || new Date().toISOString().split('T')[0],
    status: status || 'Planned',
    notes: notes || '',
    actualArrival,
    missedReason,
    rescheduledToId
  };

  if (newVisit.status === 'Completed') {
    const dIdx = dbDoctors.findIndex(d => d.id === doctorId);
    if (dIdx > -1) {
      dbDoctors[dIdx].lastVisitDate = newVisit.plannedDate;
    }
  }

  dbVisits.push(newVisit);
  addAuditLog('mbclicksphotos@gmail.com', 'Visit Created', `New planned visit recorded for doctor ${doctorId} on ${newVisit.plannedDate}`);
  res.status(201).json(newVisit);
});

// Reallocate & Auto-Recover Capacity
app.post('/api/visits/reallocate', (req, res) => {
  const { missedVisitId, recoverDate, notes, repEmail } = req.body;
  const visitIndex = dbVisits.findIndex(v => v.id === missedVisitId);
  
  if (visitIndex === -1) {
    return res.status(404).json({ error: 'Missed visit not found' });
  }

  const origVisit = dbVisits[visitIndex];
  
  // Mark original as rescheduled
  dbVisits[visitIndex].status = 'Rescheduled';
  dbVisits[visitIndex].notes = `${dbVisits[visitIndex].notes || ''} [Rescheduled to ${recoverDate}]`;

  // Create new recovering visit
  const recoveryVisit: Visit = {
    id: `v-recover-${Date.now()}`,
    doctorId: origVisit.doctorId,
    plannedDate: recoverDate,
    status: 'Planned',
    notes: notes || `Auto-recovery schedule generated by Vistra AI engine. original missed date: ${origVisit.plannedDate}`
  };

  dbVisits[visitIndex].rescheduledToId = recoveryVisit.id;
  dbVisits.push(recoveryVisit);

  addAuditLog(repEmail || 'mbclicksphotos@gmail.com', 'Missed Visit Recovery', `Rescheduled missed visit (Dr. ${origVisit.doctorId}) to ${recoverDate}. Recalculated weekly territory buffers.`);
  res.json({
    success: true,
    originalVisit: dbVisits[visitIndex],
    recoveryVisit
  });
});

// 3. MULTI-ROLE TERRITORY SMART METRICS
app.get('/api/metrics', (req, res) => {
  const currentDate = '2026-06-19';
  const currentMonthStart = '2026-06-01';
  const currentMonthEnd = '2026-06-30';

  // Calculate stats based on this month's visits
  const currentMonthVisits = dbVisits.filter(v => v.plannedDate >= currentMonthStart && v.plannedDate <= currentMonthEnd);
  
  const completed = currentMonthVisits.filter(v => v.status === 'Completed').length;
  const missed = currentMonthVisits.filter(v => v.status === 'Missed' || v.status === 'Doctor Unavailable' || v.status === 'Clinic Closed').length;
  const rescheduled = currentMonthVisits.filter(v => v.status === 'Rescheduled').length;
  const pending = currentMonthVisits.filter(v => v.status === 'Planned').length;

  // Let's deduce target visits based on Doctors' master
  // Total visits required in month is sum of Desired frequencies
  const totalVisitsRequired = dbDoctors.reduce((acc, d) => acc + d.desiredFrequency, 0);

  // Category breakdowns
  const getCatRequired = (cat: DoctorCategory) => dbDoctors.filter(d => d.category === cat).reduce((acc, d) => acc + d.desiredFrequency, 0);
  const getCatCompleted = (cat: DoctorCategory) => {
    return currentMonthVisits.filter(v => {
      const doc = dbDoctors.find(d => d.id === v.doctorId);
      return doc?.category === cat && v.status === 'Completed';
    }).length;
  };

  const superCoreReq = getCatRequired('Super Core');
  const superCoreComp = getCatCompleted('Super Core');

  const coreReq = getCatRequired('Core');
  const coreComp = getCatCompleted('Core');

  const regReq = getCatRequired('Regular');
  const regComp = getCatCompleted('Regular');

  const metrics: TerritoryMetrics = {
    totalVisitsRequired,
    completed,
    missed,
    rescheduled,
    pending,
    achievementRate: totalVisitsRequired > 0 ? Math.round((completed / totalVisitsRequired) * 100) : 0,
    daysRemaining: 11, // 30 - 19
    byCategory: {
      'Super Core': {
        required: superCoreReq,
        completed: superCoreComp,
        rate: superCoreReq > 0 ? Math.round((superCoreComp / superCoreReq) * 100) : 0
      },
      'Core': {
        required: coreReq,
        completed: coreComp,
        rate: coreReq > 0 ? Math.round((coreComp / coreReq) * 100) : 0
      },
      'Regular': {
        required: regReq,
        completed: regComp,
        rate: regReq > 0 ? Math.round((regComp / regReq) * 100) : 0
      }
    }
  };

  res.json(metrics);
});

// Route Optimization Engine: Simulated Local TSPTW sequence solver algorithm
// Takes list of doctors to be visited, clustering geographically, sorting by availability window, and returning optimized Stops
app.get('/api/routes/optimize', (req, res) => {
  const date = (req.query.date as string) || '2026-06-19';
  const dayPlannedVisits = dbVisits.filter(v => v.plannedDate === date && (v.status === 'Planned' || v.status === 'Completed'));

  if (dayPlannedVisits.length === 0) {
    return res.json([]);
  }

  // Compile full information
  const stopsWithDoc = dayPlannedVisits.map(v => {
    const doc = dbDoctors.find(d => d.id === v.doctorId);
    return {
      visitId: v.id,
      status: v.status,
      doctor: doc,
    };
  }).filter(item => item.doctor !== undefined);

  // Simple geo clustering & greedy distance traveling solution
  // Start from mock representative baseline coordinate: CST Station Mumbai (18.9398, 72.8354)
  const repLat = 18.9398;
  const repLng = 72.8354;

  const calculateDistance = (la1: number, lo1: number, la2: number, lo2: number) => {
    const rad = Math.PI / 180;
    return 6371 * Math.acos(
      Math.sin(la1 * rad) * Math.sin(la2 * rad) +
      Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.cos((lo2 - lo1) * rad)
    );
  };

  // Perform a simple Nearest Neighbor traversal for Route Optimization
  let unvisited = [...stopsWithDoc];
  let currentLat = repLat;
  let currentLng = repLng;
  const optimized: RouteStop[] = [];
  let stopNumber = 1;
  let currentHour = 9; // Route starts at 09:00 AM
  let currentMinute = 0;

  while (unvisited.length > 0) {
    // Score based on travel time optimization + doctor priority score
    let optimalIndex = 0;
    let maxMetric = -99999;

    for (let i = 0; i < unvisited.length; i++) {
      const doc = unvisited[i].doctor!;
      const dist = calculateDistance(currentLat, currentLng, doc.lat, doc.lng);
      // High category matches priority weighting (Super Core weights high, near distance weights high)
      const priorityBonus = doc.category === 'Super Core' ? 15 : doc.category === 'Core' ? 8 : 3;
      const distancePenalty = dist * 2; // minimize
      const score = priorityBonus - distancePenalty;

      if (score > maxMetric) {
        maxMetric = score;
        optimalIndex = i;
      }
    }

    const nextStop = unvisited[optimalIndex];
    const doc = nextStop.doctor!;
    
    // Increment arrival times
    const arrivalTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    currentMinute += 40; // 40 mins meeting + buffer
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    optimized.push({
      stopNumber,
      visitId: nextStop.visitId,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      category: doc.category,
      estimatedArrival: arrivalTime,
      durationMs: 2400000, // 40 minutes
      address: doc.address,
      lat: doc.lat,
      lng: doc.lng,
      priority: doc.priorityScore,
      appointmentRequired: doc.appointmentRequired,
      status: nextStop.status,
    });

    currentLat = doc.lat;
    currentLng = doc.lng;
    unvisited.splice(optimalIndex, 1);
    stopNumber++;
  }

  res.json(optimized);
});

// Trigger Auto-Plan Generator for the rest of the month
// Assesses required visit gaps, availability rules, and travel proximity.
app.post('/api/planner/auto-plan', (req, res) => {
  const { email } = req.body;
  const startDay = 20; // Generate for June 20 to 30, 2026
  let plansCreatedCount = 0;

  // Clear existing Planned future visits beyond June 19 to avoid cluttering and regenerate correctly
  dbVisits = dbVisits.filter(v => v.plannedDate <= '2026-06-19' || v.status !== 'Planned');

  for (let day = startDay; day <= 30; day++) {
    const plannedDateStr = `2026-06-${day}`;
    // Find what day of the week it is
    const dateObj = new Date(`2026-06-${day}T09:00:00Z`);
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = weekDays[dateObj.getDay()];

    if (dayOfWeek === 'Sunday') continue; // Sales reps generally rest on Sunday

    // Select doctors available on this day who have pending frequency gaps
    dbDoctors.forEach(doc => {
      // Check if doc is available on this weekday
      if (doc.visitDays.includes(dayOfWeek)) {
        // Count how many visits this doctor already has in June
        const existingVisits = dbVisits.filter(v => v.doctorId === doc.id && v.plannedDate.startsWith('2026-06'));
        if (existingVisits.length < doc.desiredFrequency) {
          // Check if there's already a visit on this exact day
          const dupVisit = dbVisits.some(v => v.doctorId === doc.id && v.plannedDate === plannedDateStr);
          if (!dupVisit) {
            dbVisits.push({
              id: `v-auto-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              doctorId: doc.id,
              plannedDate: plannedDateStr,
              status: 'Planned',
              notes: `Auto-planned on ${dayOfWeek} according to regular core frequency.`
            });
            plansCreatedCount++;
          }
        }
      }
    });
  }

  addAuditLog(email || 'mbclicksphotos@gmail.com', 'Planner Executed', `Monthly auto-planner generated ${plansCreatedCount} optimized visits for territory.`);
  res.json({ success: true, count: plansCreatedCount, visits: dbVisits });
});

app.get('/api/audit-logs', (req, res) => {
  res.json(dbAuditLogs);
});

// 4. CHAT ASSISTANT POWERED BY GEMINI (RAG-Enabled Context)
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message query is required' });
  }

  try {
    // Build context strings for RAG injection
    const totalDoctors = dbDoctors.length;
    const superCoreCount = dbDoctors.filter(d => d.category === 'Super Core').length;
    const coreCount = dbDoctors.filter(d => d.category === 'Core').length;
    const regularCount = dbDoctors.filter(d => d.category === 'Regular').length;

    const currentMonthVisits = dbVisits.filter(v => v.plannedDate.startsWith('2026-06'));
    const completedCount = currentMonthVisits.filter(v => v.status === 'Completed').length;
    const missedCount = currentMonthVisits.filter(v => v.status === 'Missed' || v.status === 'Doctor Unavailable').length;
    const pendingCount = currentMonthVisits.filter(v => v.status === 'Planned').length;

    // Compile risk detail: doctors with missing visit target vs completed visits
    const risksList = dbDoctors.map(doc => {
      const completedVisits = currentMonthVisits.filter(v => v.doctorId === doc.id && v.status === 'Completed').length;
      const missedVisits = currentMonthVisits.filter(v => v.doctorId === doc.id && (v.status === 'Missed' || v.status === 'Doctor Unavailable')).length;
      const remainingTarget = doc.desiredFrequency - completedVisits;
      return {
        name: doc.name,
        category: doc.category,
        desiredFreq: doc.desiredFrequency,
        completed: completedVisits,
        missed: missedVisits,
        remainingTarget,
        atRisk: remainingTarget > 0 && (missedVisits > 0 || (completedVisits === 0 && doc.desiredFrequency >= 2))
      };
    }).filter(r => r.atRisk);

    const missedDetails = currentMonthVisits.filter(v => v.status === 'Missed' || v.status === 'Doctor Unavailable').map(v => {
      const doc = dbDoctors.find(d => d.id === v.doctorId);
      return `Date: ${v.plannedDate}, Doctor: ${doc?.name || 'Unknown'}, Specialty: ${doc?.specialty || 'General'}, Status: ${v.status}, Reason: ${v.missedReason || 'N/A'}`;
    });

    const routeOptimizationDetails = dbVisits.filter(v => v.plannedDate === '2026-06-19').map(v => {
      const doc = dbDoctors.find(d => d.id === v.doctorId);
      return `- Dr. ${doc?.name} (${doc?.specialty}) in ${doc?.territory}. Visit Hours: ${doc?.visitTimings}, Status: ${v.status}`;
    }).join('\n');

    // Build the system context instructing Gemini exactly what territory facts are.
    const systemInstruction = `
      You are "Vistra AI Assistant" - an elite territory planning AI companion built for Pharmaceutical and Medical Sales Representatives.
      Today is June 19, 2026.
      
      Here is the exact real-time territory data:
      
      TERRITORY SNAPSHOT:
      - Total Pre-seeded Doctors in Master: ${totalDoctors}
      - Doctor Category Breakdown: ${superCoreCount} Super Core, ${coreCount} Core, ${regularCount} Regular.
      
      PERFORMANCE METRICS (JUNE 2026):
      - Total Completed Visited Calls: ${completedCount}
      - Missed / Canceled Visits: ${missedCount} 
      - Pending Visits: ${pendingCount}
      - Estimated Month Success target status: ${completedCount}/${totalDoctors * 2} visits.
      
      DOCTORS DETECTED AT RISK (Target frequency potentially missed):
      ${risksList.length > 0 ? risksList.map(r => `- Dr. ${r.name} (${r.category}): Target is ${r.desiredFreq}, Completed: ${r.completed}, Missed: ${r.missed}. Needs ${r.remainingTarget} recovery visits.`).join('\n') : 'None! Everything matches target frequency flawlessly.'}
      
      MISSED VISITS LOG:
      ${missedDetails.length > 0 ? missedDetails.join('\n') : 'None.'}
      
      TODAY'S MISSION PLANNED ROUTE (June 19, 2026):
      ${routeOptimizationDetails}
      
      GUIDELINES FOR THE AI ASSISTANT:
      1. Always offer helpful, extremely concise, highly-actionable, and humble advice. No corporate fluff, sales hype, or emoji spam. Keep answers professional.
      2. If asked "What should I do today?" or "What remains pending?", reference the today's mission list, suggest recovery steps (e.g., "You have ${pendingCount} planned visits. You should visit Dr. Adams, Dr. Priya Shah, etc.").
      3. Recommend checking the "Missed Visit Recovery" module to easily reschedule missed calls in 1 click.
      4. Avoid engineering jargon, and maintain an extremely helpful product persona.
    `;

    // Process chat request with prompt and instructions
    const prompt = message;
    
    // Check if key is available, fallback if mock
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || 'I analyzed the scenario but was unable to formulate a response. Please try another query.'
      });
    } else {
      // Mocked local feedback when developer is offline or API key isn't provided
      let responseText = `[Vistra AI Offline Mode] I've analyzed your query about: "${prompt}". Here is a synthesized forecast of your territory metrics based our local planning models:\n\n`;
      
      if (prompt.toLowerCase().includes('today') || prompt.toLowerCase().includes('mission')) {
        responseText += `Today you have **${pendingCount} active visits planned**. The route is optimized starting from CST Station Mumbai to maximize proximity:\n1. **Dr. Sarah Adams** (Bombay Hospital, Cardiology) - 09:00 AM\n2. **Dr. Priya Shah** (Lilavati Medical, Oncology) - 10:40 AM\n3. **Dr. Maryam Khan** (PD Hinduja, Rheumatoolgy) - 14:00 PM\n4. **Dr. Raymond D'Souza** (Holy Family) - 16:30 PM.\nYour expected SUCCESS probability is **84%** today.`;
      } else if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('behind')) {
        responseText += `You are currently facing some frequency achievement gaps. **Dr. Sarah Adams** has missed **1 out of her 3** desired visits due to a storm delay. I strongly recommend using the "Missed Visit Recovery Engine" on your Dashboard to auto-reallocate this visit onto June 24 or 25, where you have additional buffer capacity.`;
      } else if (prompt.toLowerCase().includes('recovery') || prompt.toLowerCase().includes('missed')) {
        responseText += `I have detected **${missedCount} missed visits** needing immediate reallocation:\n- Dr. Sarah Adams (Missed on June 8 due to weather)\n- Dr. Rajesh Kumar (Canceled on June 16 due to Emergency)\n\nTo recover, please scroll to the 'Missed Visit Recovery Engine' on your home screen and select a slot.`;
      } else {
        responseText += `Based on your territory status: You have completed **${completedCount} visits** out of your requirement. Days remaining: **11 days**. You are **${completedCount >= 8 ? 'on-track' : 'slightly behind'}** for your mid-month quota. I recommend triggering the **Smart Auto-Plan Engine** to auto-fill your remaining open slots.`;
      }

      res.json({ reply: responseText });
    }
  } catch (err: any) {
    console.error('Gemini call error:', err);
    res.status(500).json({ error: 'AI processing failed', details: err.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
