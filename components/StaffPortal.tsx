
import React, { useState } from 'react';
import { UserSession, Complaint, ComplaintStatus, Role, EscalationLog, ComplaintCategory } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { CheckCircle2, ArrowUpRight, MessageSquare, Clock, Filter, AlertCircle, Lock, User, Info, Shield } from 'lucide-react';

interface StaffPortalProps {
  session: UserSession;
  complaints: Complaint[];
  onUpdateComplaint: (complaint: Complaint) => void;
  onEscalate: (complaint: Complaint, log: EscalationLog) => void;
}

const StaffPortal: React.FC<StaffPortalProps> = ({ session, complaints, onUpdateComplaint, onEscalate }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'ESCALATED'>('ACTIVE');
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [remarks, setRemarks] = useState('');

  // Filtering Logic based on Hierarchical Rules:
  // - STAFF see issues in their department NOT escalated to HOD/Admin.
  // - HOD see issues in their department ESCALATED to HOD, or direct STAFF_RELATED issues.
  const filtered = complaints.filter(c => {
    // Basic Dept Filter
    const isTargetDept = c.department === session.department;
    if (!isTargetDept) return false;

    if (session.role === Role.STAFF) {
      if (c.category === ComplaintCategory.STAFF_RELATED) return false; // STAFF never see staff-related
      if (c.escalatedToHOD || c.escalatedToAdmin) {
        return activeTab === 'ESCALATED';
      }
    } else if (session.role === Role.HOD) {
      // HOD handles staff-related directly
      if (c.category === ComplaintCategory.STAFF_RELATED) {
         if (c.escalatedToAdmin) return activeTab === 'ESCALATED';
      } else {
         // Other categories only if specifically escalated to HOD
         if (!c.escalatedToHOD) return false;
      }
    }

    // Status Filters
    if (activeTab === 'ACTIVE') return c.status !== ComplaintStatus.RESOLVED && !c.escalatedToAdmin && (session.role === Role.STAFF ? !c.escalatedToHOD : true);
    if (activeTab === 'RESOLVED') return c.status === ComplaintStatus.RESOLVED && c.resolvedByRole === session.role;
    if (activeTab === 'ESCALATED') return c.escalatedToAdmin || (session.role === Role.STAFF && c.escalatedToHOD);
    return true;
  });

  const handleStatusUpdate = (complaint: Complaint, status: ComplaintStatus) => {
    onUpdateComplaint({ 
      ...complaint, 
      status, 
      updatedAt: new Date().toISOString(),
      staffRemarks: remarks,
      resolvedByRole: session.role
    });
    setRemarks('');
  };

  const submitEscalation = (complaint: Complaint) => {
    if (!escalateReason) return alert('Escalation reason is required.');
    
    // Tiered Escalation Logic
    const nextTierRole = session.role === Role.STAFF ? Role.HOD : Role.ADMIN;
    
    const log: EscalationLog = {
      id: `LOG-${Date.now()}`,
      complaintId: complaint.id,
      escalatedBy: `${session.role}: ${session.name}`,
      reason: escalateReason,
      timestamp: new Date().toISOString(),
      targetRole: nextTierRole
    };
    
    const updatedComplaint = {
      ...complaint,
      status: ComplaintStatus.ESCALATED,
      escalatedToHOD: nextTierRole === Role.HOD,
      escalatedToAdmin: nextTierRole === Role.ADMIN,
      updatedAt: new Date().toISOString()
    };

    onEscalate(updatedComplaint, log);
    setEscalatingId(null);
    setEscalateReason('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {session.role} Intelligence Console
          </h2>
          <div className="flex items-center mt-1 space-x-3 font-bold">
            <span className="text-slate-400">{session.department} Office</span>
            <span className="text-blue-600 uppercase tracking-widest text-xs">{session.name}</span>
          </div>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] shadow-inner">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('ESCALATED')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ESCALATED' ? 'bg-white text-red-600 shadow-xl' : 'text-slate-500'}`}
          >
            Escalated
          </button>
          <button 
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RESOLVED' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-500'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid gap-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-200">
            <Filter className="h-20 w-20 text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black text-2xl tracking-tighter uppercase">Bureau Queue Clear</p>
          </div>
        ) : (
          filtered.map(complaint => (
            <div 
              key={complaint.id} 
              className={`bg-white rounded-[2.5rem] border transition-all duration-500 ${complaint.escalatedToAdmin || (session.role === Role.STAFF && complaint.escalatedToHOD) ? 'escalated-pulse' : 'border-slate-100 shadow-lg hover:shadow-2xl'}`}
            >
              <div className="p-10">
                <div className="flex flex-col xl:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[complaint.status]}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${PRIORITY_COLORS[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                      {complaint.category === ComplaintCategory.STAFF_RELATED && (
                         <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center border border-amber-200">
                            <Shield className="h-3 w-3 mr-2" /> Direct HOD Issue
                         </span>
                      )}
                      <div className="flex-1"></div>
                      <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-widest">Grievance ID: {complaint.id}</span>
                    </div>

                    <div>
                      <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">{complaint.title}</h3>
                      <p className="text-slate-500 font-medium text-lg mt-4 leading-relaxed">{complaint.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                        <div className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                           <User className="h-4 w-4 mr-3 text-blue-400" />
                           {complaint.studentName} &bull; {complaint.studentId}
                        </div>
                        <div className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                           <Clock className="h-4 w-4 mr-3 text-slate-400" />
                           {new Date(complaint.createdAt).toLocaleString()}
                        </div>
                    </div>
                  </div>

                  <div className="xl:w-80 flex flex-col justify-center space-y-4 border-t xl:border-t-0 xl:border-l border-slate-100 pt-8 xl:pt-0 xl:pl-10">
                    {activeTab === 'ACTIVE' ? (
                      <>
                        <div className="space-y-2 mb-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Remarks</label>
                            <textarea 
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              className="w-full text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
                              placeholder="Action log..."
                              rows={2}
                            />
                        </div>
                        <button 
                          onClick={() => handleStatusUpdate(complaint, ComplaintStatus.IN_PROGRESS)}
                          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all ${complaint.status === ComplaintStatus.IN_PROGRESS ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <Clock className="h-4 w-4" />
                          <span>{complaint.status === ComplaintStatus.IN_PROGRESS ? 'Resolving' : 'Initialize'}</span>
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(complaint, ComplaintStatus.RESOLVED)}
                          className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center space-x-3 transition-all shadow-xl shadow-emerald-100"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Resolve</span>
                        </button>
                        <div className="h-px bg-slate-100 my-4"></div>
                        <button 
                          onClick={() => setEscalatingId(complaint.id)}
                          className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center space-x-3 transition-all border border-red-100"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span>Escalate Tier</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
                        {activeTab === 'ESCALATED' ? (
                          <Lock className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        ) : (
                          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                        )}
                        <div className="text-slate-900 font-black text-[11px] uppercase tracking-[0.2em]">{activeTab}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {escalatingId === complaint.id && (
                <div className="bg-slate-900 p-10 rounded-b-[2.5rem] text-white animate-in slide-in-from-top duration-300">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-400 mb-6">Hierarchy Protocol Shift</h4>
                  <textarea 
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="Provide categorical rationale for authority transfer..."
                    className="w-full p-5 bg-slate-800 border border-slate-700 text-white rounded-[1.5rem] mb-8 text-sm outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                    rows={3}
                  ></textarea>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => submitEscalation(complaint)}
                      className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl"
                    >
                      Authorize Escalation
                    </button>
                    <button 
                      onClick={() => setEscalatingId(null)}
                      className="px-10 py-5 bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffPortal;
