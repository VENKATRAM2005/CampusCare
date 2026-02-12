
import React, { useState } from 'react';
import { UserSession, Complaint, ComplaintStatus, ComplaintCategory, Priority, Department, StudentDept } from '../types';
import { classifyComplaint } from '../services/geminiService';
import { STATUS_COLORS, PRIORITY_COLORS, CATEGORY_ROUTING, STUDENT_DEPTS, COMPLAINT_CATEGORIES } from '../constants';
import { Plus, Send, Clock, CheckCircle2, AlertTriangle, Search, User, Building, Layers } from 'lucide-react';

interface StudentPortalProps {
  session: UserSession;
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => void;
  onUpdateComplaint: (complaint: Complaint) => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ session, complaints, onAddComplaint, onUpdateComplaint }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: session.name,
    studentId: session.id,
    dept: StudentDept.CSE,
    category: ComplaintCategory.OTHERS,
    title: '', 
    description: '' 
  });
  const [error, setError] = useState('');

  const validateStudentId = (id: string) => /^\d{8}$/.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStudentId(formData.studentId)) {
      setError('Student ID must be exactly 8 digits.');
      return;
    }

    if (!formData.name || !formData.title || !formData.description) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use AI primarily for priority detection and summary, 
      // but honor the user's category selection as primary routing.
      const aiAnalysis = await classifyComplaint(formData.title, formData.description);
      
      const resolvingDept = CATEGORY_ROUTING[formData.category](formData.dept);

      // Fix: Added missing required field 'escalatedToHOD'
      const newComplaint: Complaint = {
        id: `CMP-${Date.now()}`,
        studentId: formData.studentId,
        studentName: formData.name,
        studentDept: formData.dept,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: aiAnalysis.priority,
        status: ComplaintStatus.PENDING,
        department: resolvingDept,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        escalatedToAdmin: false,
        escalatedToHOD: false
      };

      onAddComplaint(newComplaint);
      setFormData({ ...formData, title: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to process complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Governance Portal</h2>
          <p className="text-slate-500">Submit and track your institutional grievances.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          {showForm ? <Search className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          <span>{showForm ? 'My History' : 'Lodge Grievance'}</span>
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-8 flex items-center text-slate-800">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
               <Send className="h-5 w-5 text-blue-600" />
            </div>
            New Grievance Submission
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Student ID (8 Digits)</label>
                <input 
                  type="text" 
                  maxLength={8}
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ex: 20230001"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    value={formData.dept}
                    onChange={(e) => setFormData({...formData, dept: e.target.value as StudentDept})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    {STUDENT_DEPTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Complaint Category</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as ComplaintCategory})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    {COMPLAINT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject Header</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Brief summary of the issue"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Complete Narrative</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Describe the grievance in detail. High-priority keywords will trigger automatic escalation markers."
              ></textarea>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center border border-red-100">
                <AlertTriangle className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg text-sm uppercase tracking-widest ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {isSubmitting ? 'Routing Grievance...' : 'Submit to Authority'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-6">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium text-lg">No grievances found in your profile.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-bold hover:underline">File your first complaint now</button>
            </div>
          ) : (
            complaints.map(complaint => (
              <div key={complaint.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[complaint.status]}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${PRIORITY_COLORS[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-300">#{complaint.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{complaint.title}</h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">{complaint.description}</p>
                  </div>

                  <div className="flex items-center space-x-6 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                      RESOLVER: {complaint.department}
                    </span>
                    <span className="text-slate-300">Category: {complaint.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="md:w-56 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  {complaint.status === ComplaintStatus.RESOLVED ? (
                    <div className="text-center bg-emerald-50 p-4 rounded-2xl">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                      <span className="text-emerald-700 font-black text-xs block uppercase">Case Resolved</span>
                      <div className="mt-2 text-[10px] text-slate-400 italic">Resolved by {complaint.resolvedByRole}</div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                        <Clock className="h-10 w-10 text-blue-500 relative" />
                      </div>
                      <span className="text-slate-500 font-bold text-xs block mt-3 uppercase tracking-tighter">In Queue</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Pending Review</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
