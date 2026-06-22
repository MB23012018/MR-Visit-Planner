import { UserRole } from '../types';
import { Shield, User, CheckCircle } from 'lucide-react';

interface RoleSwitcherProps {
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export default function RoleSwitcher({ activeRole, onChangeRole }: RoleSwitcherProps) {
  const rolesInfo: Record<UserRole, { desc: string; permissions: string[] }> = {
    'Medical Representative': {
      desc: 'Ground operations agent. Primarily focused on daily targets, routing sequence, and immediate recovery visits.',
      permissions: ['Manage personal calendar', 'Execute daily check-ins', 'Trigger routing optimization', 'Recover missed calls'],
    },
    'Area Manager': {
      desc: 'First-line manager supervising 8-12 MRs. Performs weekly review audits and holds master edit approvals.',
      permissions: ['View team dashboards', 'Edit doctor master profiles', 'Approve manual schedule alterations', 'Generate target predictions'],
    },
    'Regional Manager': {
      desc: 'Middle management monitoring multiple clinics, compliance scores, and national brand coverage ratios.',
      permissions: ['Aggregate territory audit indicators', 'Inspect predictive compliance curves', 'Reallocate budget buffers'],
    },
    'National Sales Manager': {
      desc: 'Strategic commercial head checking general performance trajectories and resource allocations across zones.',
      permissions: ['Global dashboard review', 'Extract comparative predictive insights', 'Export performance matrices'],
    },
    'Admin': {
      desc: 'Full administrative access role controlling database states, bulk uploads, security controls, and audit trails.',
      permissions: ['Full Master CRUD access', 'Trigger full-month auto-planners', 'Review security audit streams', 'Manage RBAC rules'],
    },
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 mb-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-2xl text-blue-500 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black tracking-tight text-xl flex items-center flex-wrap gap-2 uppercase">
              Identity & Role Control Center 
              <span className="text-[10px] tracking-widest px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold uppercase">RBAC ENGAGED</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Simulate different stakeholder workflows on the fly</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(rolesInfo) as UserRole[]).map((role) => {
            const isSelected = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => onChangeRole(role)}
                id={`role-btn-${role.replace(/\s+/g, '-').toLowerCase()}`}
                className={`px-4 py-2 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102'
                    : 'bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800">
        <div className="md:col-span-2">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.25em] font-black">Active Profile Context</p>
          <div className="flex items-start gap-3 mt-3">
            <div className="bg-slate-950 p-2 rounded-xl mt-0.5 shrink-0 border border-slate-800">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-display font-black text-slate-100 uppercase tracking-wide">{activeRole === 'Medical Representative' ? 'Arjun Sharma (Field Agent - South Mumbai)' : `Stakeholder Profile: ${activeRole}`}</p>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed font-medium">{rolesInfo[activeRole].desc}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.2em] font-black mb-3">Granted Scopes</p>
          <ul className="space-y-2">
            {rolesInfo[activeRole].permissions.map((perm, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-bold tracking-wide">{perm}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
