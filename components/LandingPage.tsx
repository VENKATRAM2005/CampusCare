
import React, { useState, useEffect } from 'react';
import { Role, UserSession, Department } from '../types';
import { GraduationCap, ShieldCheck, Briefcase, UserRoundSearch, Shield, ArrowLeft, Lock, User as UserIcon } from 'lucide-react';
import { MOCK_USERS } from '../constants';

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [autoName, setAutoName] = useState('');
  const [error, setError] = useState('');

  // Auto-fill logic when user types ID
  useEffect(() => {
    const user = (MOCK_USERS as any)[userId];
    if (user) {
      setAutoName(user.name);
    } else {
      setAutoName('');
    }
  }, [userId]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = (MOCK_USERS as any)[userId];
    if (user && user.role === selectedRole && user.password === password) {
      onLogin({
        id: userId,
        name: user.name,
        role: user.role,
        department: user.dept as Department
      });
    } else {
      setError('Invalid ID or Password for this role.');
    }
  };

  if (selectedRole) {
    return (
      <div className="max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedRole(null)}
          className="flex items-center text-slate-500 hover:text-slate-900 mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Selection
        </button>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              {selectedRole} Login
            </h2>
            <p className="text-slate-500 text-sm mt-1">Enter your institutional credentials</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account ID</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                  placeholder="Enter your ID"
                  required
                />
              </div>
            </div>

            {autoName && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 font-bold text-sm flex items-center animate-in zoom-in-95 duration-200">
                <Shield className="h-4 w-4 mr-2" />
                Verified: {autoName}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tighter">
          CampusCare Governance
        </h1>
        <p className="text-xl text-slate-600">
          Hierarchical Grievance Resolution for High-Performance Institutions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Student Portal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all text-center flex flex-col">
          <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold mb-1">Student</h2>
          <p className="text-slate-500 mb-6 text-sm flex-grow">Submit & track grievances from your department.</p>
          <button 
            onClick={() => setSelectedRole(Role.STUDENT)}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Access Portal
          </button>
        </div>

        {/* Staff Portal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all text-center flex flex-col">
          <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold mb-1">Dept Staff</h2>
          <p className="text-slate-500 mb-6 text-sm flex-grow">Maintenance, Administration, or Dept Staff.</p>
          <button 
            onClick={() => setSelectedRole(Role.STAFF)}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            Access Portal
          </button>
        </div>

        {/* HOD Portal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all text-center flex flex-col">
          <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserRoundSearch className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold mb-1">HOD Office</h2>
          <p className="text-slate-500 mb-6 text-sm flex-grow">Handles Staff-Related & Academic escalations.</p>
          <button 
            onClick={() => setSelectedRole(Role.HOD)}
            className="w-full py-2.5 px-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors text-sm"
          >
            Access Portal
          </button>
        </div>

        {/* Admin Portal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all text-center flex flex-col">
          <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold mb-1">Principal Office</h2>
          <p className="text-slate-500 mb-6 text-sm flex-grow">Final escalation authority & institution oversight.</p>
          <button 
            onClick={() => setSelectedRole(Role.ADMIN)}
            className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
          >
            Access Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
