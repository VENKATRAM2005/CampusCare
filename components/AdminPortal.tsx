
import React, { useState } from 'react';
import { UserSession, Complaint, EscalationLog, ComplaintStatus, Role, Priority } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LEVELS } from '../constants';
import Analytics from './Analytics';
import { 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ChevronRight, 
  AlertTriangle,
  Zap,
  LayoutDashboard
} from 'lucide-react';

interface AdminPortalProps {
  session: UserSession;
  complaints: Complaint[];
  escalationLogs: EscalationLog[];
  onUpdateComplaint: (complaint: Complaint) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ session, complaints, escalationLogs, onUpdateComplaint }) => {
  const [view, setView] = useState<'DASHBOARD' | 'ESCALATIONS' | 'ALL'>('DASHBOARD');
  const [remarks, setRemarks] = useState('');

  // Sort function to order by priority (High -> Medium -> Low)
  const sortByPriority = (list: Complaint[]) => {
    return [...list].sort((a, b) => {
      const aVal = PRIORITY_LEVELS[a.priority as Priority] || 0;
      const bVal = PRIORITY_LEVELS[b.priority as Priority] || 0;
      return bVal - aVal;
    });
  };

  const escalated = sortByPriority(complaints.filter(c => c.escalatedToAdmin && c.status !== ComplaintStatus.RESOLVED));
  const allComplaints = sortByPriority(complaints);
  
  const handleResolve = (complaint: Complaint) => {
    onUpdateComplaint({
      ...complaint,
      status: ComplaintStatus.RESOLVED,
      resolvedByRole: Role.ADMIN,
      adminRemarks: remarks,
      updatedAt: new Date().toISOString()
    });
    setRemarks('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Governance Command</h2>
          <p className="text-slate-500">Principal Office Monitoring & Tier-2 Resolution Platform.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setView('ESCALATIONS')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'ESCALATIONS' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Escalation Center</span>
            {escalated.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1 animate-bounce">{escalated.length}</span>}
          </button>
          <button 
            onClick={() => setView('ALL')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'ALL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Full Inventory</span>
          </button>
        </div>
      </div>

      {view === 'DASHBOARD' && <Analytics complaints={complaints} />}

      {(view === 'ESCALATIONS' || view === 'ALL') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-slate-800">
              {view === 'ESCALATIONS' ? 'Priority Escalations' : 'All Institutional Grievances'}
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Sorted by Priority Level
            </span>
          </div>

          <div className="grid gap-6">
            {(view === 'ESCALATIONS' ? escalated : allComplaints).map(complaint => {
              const log = escalationLogs.find(l => l.complaintId === complaint.id);
              
              return (
                <div key={complaint.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${complaint.escalatedToAdmin && complaint.status !== ComplaintStatus.RESOLVED ? 'border-red-200' : 'border-slate-100'} hover:shadow-xl transition-all`}>
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${STATUS_COLORS[complaint.status]}`}>
                            {complaint.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${PRIORITY_COLORS[complaint.priority]}`}>
                            {complaint.priority}
                          </span>
                          <span className="text-xs font-mono text-slate-400"># {complaint.id}</span>
                          <div className="flex-1"></div>
                          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-bold uppercase">{complaint.category}</span>
                        </div>

                        <div>
                          <h4 className="text-2xl font-bold text-slate-900 leading-tight tracking-tighter">{complaint.title}</h4>
                          <p className="text-slate-600 text-lg mt-2 leading-relaxed">{complaint.description}</p>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center text-slate-400 font-bold">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Reported: {new Date(complaint.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-blue-500 font-bold">
                            <Zap className="h-4 w-4 mr-2" />
                            <span>Dept: {complaint.department}</span>
                          </div>
                        </div>

                        {log && (
                          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <h5 className="text-red-800 text-xs font-black uppercase tracking-wider mb-2 flex items-center">
                              <ShieldAlert className="h-4 w-4 mr-1" /> Escalation Dossier
                            </h5>
                            <div className="text-slate-700 font-medium italic border-l-2 border-red-300 pl-4 py-1">
                              "{log.reason}"
                            </div>
                            <div className="mt-2 text-[10px] text-red-500 font-bold uppercase">
                              Escalated By: {log.escalatedBy} &bull; {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:w-80 space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                        {complaint.status !== ComplaintStatus.RESOLVED ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Remarks</label>
                              <textarea 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                placeholder="Final resolution notes..."
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <button 
                                onClick={() => handleResolve(complaint)}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Resolve Case</span>
                              </button>
                              <button 
                                onClick={() => onUpdateComplaint({...complaint, status: ComplaintStatus.IN_PROGRESS})}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-slate-200"
                              >
                                <Clock className="h-5 w-5" />
                                <span>Active Investigation</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                            <div className="text-emerald-900 font-black text-sm uppercase tracking-widest tracking-widest">Case Closed</div>
                            <div className="text-emerald-600 text-[10px] font-bold mt-1 uppercase">Resolved by {complaint.resolvedByRole || 'Staff'}</div>
                            {complaint.adminRemarks && (
                                <div className="mt-3 text-[10px] text-emerald-800 bg-white/50 p-2 rounded-lg italic">
                                  "{complaint.adminRemarks}"
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
