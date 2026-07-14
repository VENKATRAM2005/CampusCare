
import React, { useState } from 'react';
import { UserSession, Complaint, EscalationLog, ComplaintStatus, Role, Priority, ComplaintCategory, Department } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LEVELS, COMPLAINT_CATEGORIES } from '../constants';
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
  LayoutDashboard,
  User as UserIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  TrendingUp
} from 'lucide-react';

interface AdminPortalProps {
  session: UserSession;
  complaints: Complaint[];
  escalationLogs: EscalationLog[];
  onUpdateComplaint: (complaint: Complaint) => void;
  onAddEscalationLog: (log: EscalationLog) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ session, complaints, escalationLogs, onUpdateComplaint, onAddEscalationLog }) => {
  const [view, setView] = useState<'DASHBOARD' | 'ESCALATIONS' | 'ALL' | 'ANALYTICS'>('DASHBOARD');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [expandedStudentInfo, setExpandedStudentInfo] = useState<string | null>(null);

  const filterComplaints = (list: Complaint[]) => {
    return list.filter(c => {
      const matchesSearch = !searchTerm || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
      const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
      const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
      const matchesDepartment = filterDepartment === 'ALL' || c.department === filterDepartment;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesDepartment;
    });
  };

  // Sort function to strictly order by priority level (High: 3, Medium: 2, Low: 1)
  const sortByPriority = (list: Complaint[]) => {
    return [...list].sort((a, b) => {
      const aVal = PRIORITY_LEVELS[a.priority as Priority] || 0;
      const bVal = PRIORITY_LEVELS[b.priority as Priority] || 0;
      // Primary sort: Priority Level (descending)
      if (bVal !== aVal) return bVal - aVal;
      // Secondary sort: Recency (descending)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const escalated = sortByPriority(filterComplaints(complaints.filter(c => c.escalatedToAdmin && c.status !== ComplaintStatus.RESOLVED)));
  const allComplaints = sortByPriority(filterComplaints(complaints));
  
  const handleResolve = (complaint: Complaint) => {
    const now = new Date().toISOString();
    onUpdateComplaint({
      ...complaint,
      status: ComplaintStatus.RESOLVED,
      resolvedByRole: Role.ADMIN,
      adminRemarks: remarks,
      updatedAt: now
    });

    // Logging requirement
    const existingLog = escalationLogs.find(l => l.complaintId === complaint.id);
    if (existingLog) {
      // If escalated, we could update the log, but the prompt says "include the admin's remarks in the escalation log"
      // Since logs are immutable in our current setup (only onAddEscalationLog), I'll add a new log entry
      // that specifically mentions the resolution by admin if it was escalated.
      onAddEscalationLog({
        id: `LOG-${Date.now()}`,
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: ComplaintStatus.RESOLVED,
        escalatedBy: session.name,
        reason: `Admin Resolution: ${remarks}`,
        timestamp: now
      });
    } else {
      // If not escalated but resolved directly by admin
      onAddEscalationLog({
        id: `LOG-${Date.now()}`,
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: ComplaintStatus.RESOLVED,
        escalatedBy: session.name,
        reason: `Direct Admin Resolution: ${remarks}`,
        timestamp: now
      });
    }

    setRemarks('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Governance Command</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Principal Office &bull; Institution Redressal Authority</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setView('ESCALATIONS')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'ESCALATIONS' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Priority Queue</span>
            {escalated.length > 0 && <span className="bg-red-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full ml-1 animate-pulse">{escalated.length}</span>}
          </button>
          <button 
            onClick={() => setView('ALL')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'ALL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Master Inventory</span>
          </button>
          <button 
            onClick={() => setView('ANALYTICS')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'ANALYTICS' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {(view === 'DASHBOARD' || view === 'ANALYTICS') && <Analytics complaints={complaints} />}

      {(view === 'ESCALATIONS' || view === 'ALL') && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                {view === 'ESCALATIONS' ? 'Executive Priority Redressal' : 'Full Institutional Audit'}
              </h3>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by Title, ID, or Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
              </div>
              
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Categories</option>
                {COMPLAINT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>

              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Statuses</option>
                {Object.values(ComplaintStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Priorities</option>
                {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Departments</option>
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button 
                onClick={() => {
                  setFilterCategory('ALL');
                  setFilterStatus('ALL');
                  setFilterPriority('ALL');
                  setFilterDepartment('ALL');
                  setSearchTerm('');
                }}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Reset All
              </button>
            </div>
          </div>

          <div className="grid gap-8">
            {(view === 'ESCALATIONS' ? escalated : allComplaints).map(complaint => {
              const log = escalationLogs.find(l => l.complaintId === complaint.id);
              
              return (
                <div key={complaint.id} className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border transition-all duration-300 ${complaint.escalatedToAdmin && complaint.status !== ComplaintStatus.RESOLVED ? 'border-red-200 shadow-xl' : 'border-slate-100 hover:shadow-2xl'}`}>
                  <div className="p-10">
                    <div className="flex flex-col lg:flex-row gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[complaint.status]}`}>
                            {complaint.status}
                          </span>
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${PRIORITY_COLORS[complaint.priority]}`}>
                            {complaint.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-widest">Protocol ID: {complaint.id}</span>
                          <div className="flex-1"></div>
                          <span className="text-[10px] text-slate-500 bg-slate-50 px-4 py-2 rounded-full font-black uppercase tracking-widest border border-slate-100">{complaint.category.replace('_', ' ')}</span>
                        </div>

                        <div>
                          <h4 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">{complaint.title}</h4>
                          <p className="text-slate-600 text-lg mt-4 leading-relaxed font-medium">{complaint.description}</p>
                          {complaint.imageUrl && (
                            <div className="mt-6 w-full max-w-2xl rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl group/img relative">
                              <img src={complaint.imageUrl} alt="Evidence" className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-110" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-8">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Multimodal Evidence Analysis Attached</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                          <div className="space-y-2">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grievant Identity</div>
                            <div className="flex items-center text-sm font-bold text-slate-700">
                              <UserIcon className="h-4 w-4 mr-2 text-blue-500" />
                              {complaint.studentName} &bull; {complaint.studentId}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Path</div>
                            <div className="flex items-center text-sm font-bold text-slate-900 uppercase">
                              <Zap className="h-4 w-4 mr-2 text-amber-500" />
                              Resolver: {complaint.department}
                            </div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Filed: {new Date(complaint.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        {complaint.status === ComplaintStatus.RESOLVED && (
                          <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-6">
                              <div className="bg-white p-4 rounded-2xl shadow-sm">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                              </div>
                              <div>
                                <div className="text-emerald-900 font-black text-xs uppercase tracking-[0.2em]">Redressal Finalized</div>
                                <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-widest">
                                  Resolved At: {new Date(complaint.updatedAt).toLocaleString()}
                                </div>
                                <div className="text-[9px] text-slate-400 font-black mt-1 uppercase tracking-widest">Authority: {complaint.resolvedByRole || 'Mentor'}</div>
                              </div>
                            </div>
                            {complaint.adminRemarks && (
                              <div className="flex-1 max-w-md bg-white/80 p-5 rounded-2xl italic font-bold text-[11px] text-emerald-800 border border-emerald-100 leading-relaxed shadow-sm">
                                "{complaint.adminRemarks}"
                              </div>
                            )}
                          </div>
                        )}

                        <div className="border-t border-slate-100 pt-4">
                          <button 
                            onClick={() => setExpandedStudentInfo(expandedStudentInfo === complaint.id ? null : complaint.id)}
                            className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded-full transition-all"
                          >
                            {expandedStudentInfo === complaint.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span>{expandedStudentInfo === complaint.id ? 'Hide' : 'View'} Student Profile & Department Details</span>
                          </button>

                          {expandedStudentInfo === complaint.id && (
                            <div className="mt-4 grid md:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Full Name</span>
                                <span className="text-xs font-bold text-slate-800">{complaint.studentName}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Student ID</span>
                                <span className="text-xs font-bold text-slate-800">{complaint.studentId}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Department</span>
                                <span className="text-xs font-bold text-slate-800">{complaint.studentDept}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {log && (
                          <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
                            <h5 className="text-red-800 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center">
                              <ShieldAlert className="h-4 w-4 mr-2" /> Tier-3 Escalation Rationale
                            </h5>
                            <div className="text-slate-700 font-bold italic border-l-4 border-red-300 pl-6 py-2 leading-relaxed">
                              "{log.reason}"
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                                  Author: {log.escalatedBy}
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">
                                  {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:w-96 space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-10 lg:pt-0 lg:pl-10">
                        {complaint.status !== ComplaintStatus.RESOLVED ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Resolution Summary</label>
                              <textarea 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full text-sm font-bold p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                                placeholder="Executive action taken..."
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <button 
                                onClick={() => handleResolve(complaint)}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-95"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Authorize Closure</span>
                              </button>
                              <button 
                                onClick={() => onUpdateComplaint({...complaint, status: ComplaintStatus.IN_PROGRESS})}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-xl shadow-slate-200"
                              >
                                <Clock className="h-5 w-5" />
                                <span>Active Investigation</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-10 bg-emerald-50/30 rounded-[3rem] border border-emerald-100/50">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                            <div className="text-emerald-900 font-black text-[10px] uppercase tracking-[0.3em]">Case Closed</div>
                            <div className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Audit Complete</div>
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
