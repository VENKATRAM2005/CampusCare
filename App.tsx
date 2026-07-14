
import React, { useState, useEffect } from 'react';
import { Role, Complaint, UserSession, Department, ComplaintStatus, EscalationLog, ReviewWindow, TeachingReview, InstitutionalReport } from './types';
import { 
  getEscalationLogs, saveEscalationLogs,
  getReviewWindows, saveReviewWindows,
  getTeachingReviews, saveTeachingReviews,
  getInstitutionalReports, saveInstitutionalReports
} from './services/storageService';
import { createComplaint as createComplaintRequest, fetchComplaints } from './services/complaintApi';
import Layout from './components/Layout';
import StudentPortal from './components/StudentPortal';
import MentorPortal from './components/MentorPortal';
import AdminPortal from './components/AdminPortal';
import LandingPage from './components/LandingPage';
import TeachingReviewModule from './components/TeachingReviewModule';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);

  // Teaching Review State
  const [reviewWindows, setReviewWindows] = useState<ReviewWindow[]>(getReviewWindows());
  const [teachingReviews, setTeachingReviews] = useState<TeachingReview[]>(getTeachingReviews());
  const [institutionalReports, setInstitutionalReports] = useState<InstitutionalReport[]>(getInstitutionalReports());
  const [activeModule, setActiveModule] = useState<'GRIEVANCE' | 'REVIEW'>('GRIEVANCE');

  const loadComplaints = async () => {
    try {
      setComplaints(await fetchComplaints());
    } catch (error) {
      console.error('Failed to load complaints from backend.', error);
      setComplaints([]);
    }
  };

  useEffect(() => {
    setEscalationLogs(getEscalationLogs());
    setReviewWindows(getReviewWindows());
    setTeachingReviews(getTeachingReviews());
    setInstitutionalReports(getInstitutionalReports());
    
    const savedSession = localStorage.getItem('campuscare_session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    void loadComplaints();
  }, []);

  useEffect(() => {
    saveEscalationLogs(escalationLogs);
  }, [escalationLogs]);

  useEffect(() => {
    saveReviewWindows(reviewWindows);
  }, [reviewWindows]);

  useEffect(() => {
    saveTeachingReviews(teachingReviews);
  }, [teachingReviews]);

  useEffect(() => {
    saveInstitutionalReports(institutionalReports);
  }, [institutionalReports]);

  const handleLogin = (user: UserSession) => {
    setSession(user);
    localStorage.setItem('campuscare_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('campuscare_session');
  };

  const addComplaint = async (complaint: Complaint) => {
    const now = new Date().toISOString();
    const complaintWithHistory: Complaint = {
      ...complaint,
      statusHistory: [
        {
          status: ComplaintStatus.PENDING,
          timestamp: now,
          updatedBy: 'System',
          remarks: 'Grievance filed successfully.'
        }
      ]
    };

    await createComplaintRequest(complaintWithHistory);
    await loadComplaints();
  };

  const updateComplaint = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === updated.id) {
        // If status changed, add to history
        if (c.status !== updated.status) {
          const now = new Date().toISOString();
          const newHistory = [
            ...c.statusHistory,
            {
              status: updated.status,
              timestamp: now,
              updatedBy: session?.name || 'System',
              remarks: updated.status === ComplaintStatus.RESOLVED ? updated.adminRemarks || updated.mentorRemarks : undefined
            }
          ];
          return { ...updated, statusHistory: newHistory };
        }
        return updated;
      }
      return c;
    }));
  };

  const deleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
  };

  const addEscalationLog = (log: EscalationLog) => {
    setEscalationLogs(prev => [log, ...prev]);
  };

  const getRelevantComplaints = () => {
    if (!session) return [];
    
    if (session.role === Role.STUDENT) {
      return complaints.filter(c => c.studentId === session.id);
    }
    
    if (session.role === Role.ADMIN) {
      return complaints;
    }
    
    // Mentor and HOD see complaints belonging to their resolving department
    // For HOD, we can show all complaints in their department
    return complaints.filter(c => c.department === session.department);
  };

  const getRelevantReviewWindow = (dept?: Department | string) => {
    const targetDept = dept || session?.department || 'INSTITUTIONAL';
    let window = reviewWindows.find(w => w.department === targetDept);
    if (!window) {
      window = {
        id: `WIN-${targetDept}-${Date.now()}`,
        department: targetDept as Department | 'INSTITUTIONAL',
        isOpen: false,
        semesterId: '',
        year: '',
        type: 'ODD'
      };
    }
    return window;
  };

  const updateReviewWindow = (updated: ReviewWindow) => {
    setReviewWindows(prev => {
      const exists = prev.find(w => w.department === updated.department);
      if (exists) {
        return prev.map(w => w.department === updated.department ? updated : w);
      }
      return [...prev, updated];
    });
  };

  return (
    <Layout session={session} onLogout={handleLogout}>
      {!session ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <>
          {session.role === Role.STUDENT && (
            <div className="space-y-8">
              <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mx-auto shadow-inner">
                <button 
                  onClick={() => setActiveModule('GRIEVANCE')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'GRIEVANCE' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
                >
                  Grievance Hub
                </button>
                <button 
                  onClick={() => setActiveModule('REVIEW')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'REVIEW' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
                >
                  Teaching Review
                </button>
              </div>

              {activeModule === 'GRIEVANCE' ? (
                <StudentPortal 
                  session={session} 
                  complaints={getRelevantComplaints()} 
                  onAddComplaint={addComplaint}
                  onUpdateComplaint={updateComplaint}
                  onDeleteComplaint={deleteComplaint}
                />
              ) : (
                <TeachingReviewModule 
                  session={session}
                  reviewWindow={getRelevantReviewWindow(session.department)}
                  reviews={teachingReviews}
                  onAddReview={(r) => setTeachingReviews(prev => [r, ...prev])}
                />
              )}
            </div>
          )}
          {(session.role === Role.MENTOR || session.role === Role.HOD) && (
            <div className="space-y-8">
              <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mx-auto shadow-inner">
                <button 
                  onClick={() => setActiveModule('GRIEVANCE')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'GRIEVANCE' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
                >
                  Grievance Console
                </button>
                <button 
                  onClick={() => setActiveModule('REVIEW')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'REVIEW' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
                >
                  Review Analytics
                </button>
              </div>

              {activeModule === 'GRIEVANCE' ? (
                <MentorPortal 
                  session={session} 
                  complaints={getRelevantComplaints()} 
                  onUpdateComplaint={updateComplaint}
                  onEscalate={(updated, log) => {
                    updateComplaint(updated);
                    addEscalationLog(log);
                  }}
                />
              ) : (
                <TeachingReviewModule 
                  session={session}
                  reviewWindow={getRelevantReviewWindow(session.department)}
                  reviews={teachingReviews}
                  reports={institutionalReports}
                  onUpdateWindow={updateReviewWindow}
                  onAddReport={(r) => setInstitutionalReports(prev => [r, ...prev])}
                />
              )}
            </div>
          )}
          {session.role === Role.ADMIN && (
            <div className="space-y-8">
              <AdminPortal 
                session={session} 
                complaints={complaints} 
                escalationLogs={escalationLogs}
                onUpdateComplaint={updateComplaint}
                onAddEscalationLog={addEscalationLog}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
