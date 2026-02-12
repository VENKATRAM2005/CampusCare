
import React, { useState, useEffect } from 'react';
import { Role, Complaint, UserSession, Department, ComplaintStatus, StudentDept } from './types';
import { getComplaints, saveComplaints, getEscalationLogs, saveEscalationLogs } from './services/storageService';
import Layout from './components/Layout';
import StudentPortal from './components/StudentPortal';
import StaffPortal from './components/StaffPortal';
import AdminPortal from './components/AdminPortal';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalationLogs, setEscalationLogs] = useState([]);

  useEffect(() => {
    setComplaints(getComplaints());
    setEscalationLogs(getEscalationLogs() as any);
    
    const savedSession = localStorage.getItem('campuscare_session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    saveComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    saveEscalationLogs(escalationLogs);
  }, [escalationLogs]);

  const handleLogin = (user: UserSession) => {
    setSession(user);
    localStorage.setItem('campuscare_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('campuscare_session');
  };

  const addComplaint = (complaint: Complaint) => {
    setComplaints(prev => [complaint, ...prev]);
  };

  const updateComplaint = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const addEscalationLog = (log: any) => {
    setEscalationLogs(prev => [log, ...prev] as any);
  };

  const getRelevantComplaints = () => {
    if (!session) return [];
    
    if (session.role === Role.STUDENT) {
      return complaints.filter(c => c.studentId === session.id);
    }
    
    if (session.role === Role.ADMIN) {
      return complaints;
    }
    
    // Staff and HOD see complaints belonging to their resolving department
    return complaints.filter(c => c.department === session.department);
  };

  return (
    <Layout session={session} onLogout={handleLogout}>
      {!session ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <>
          {session.role === Role.STUDENT && (
            <StudentPortal 
              session={session} 
              complaints={getRelevantComplaints()} 
              onAddComplaint={addComplaint}
              onUpdateComplaint={updateComplaint}
            />
          )}
          {(session.role === Role.STAFF || session.role === Role.HOD) && (
            <StaffPortal 
              session={session} 
              complaints={getRelevantComplaints()} 
              onUpdateComplaint={updateComplaint}
              onEscalate={(updated, log) => {
                updateComplaint(updated);
                addEscalationLog(log);
              }}
            />
          )}
          {session.role === Role.ADMIN && (
            <AdminPortal 
              session={session} 
              complaints={complaints} 
              escalationLogs={escalationLogs}
              onUpdateComplaint={updateComplaint}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
