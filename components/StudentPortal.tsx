
import React, { useState, useEffect } from 'react';
import { UserSession, Complaint, ComplaintStatus, ComplaintCategory, Priority, Department, StudentDept, Feedback } from '../types';
import { classifyComplaint } from '../services/geminiService';
import { STATUS_COLORS, PRIORITY_COLORS, CATEGORY_ROUTING, STUDENT_DEPTS, COMPLAINT_CATEGORIES, MOCK_USERS } from '../constants';
import { Plus, Send, Clock, CheckCircle2, AlertTriangle, Search, User, Building, Layers, Zap, Trash2, X, Star, LayoutDashboard, ShieldAlert, ChevronRight } from 'lucide-react';

interface StudentPortalProps {
  session: UserSession;
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => Promise<void> | void;
  onUpdateComplaint: (complaint: Complaint) => void;
  onDeleteComplaint: (id: string) => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ session, complaints, onAddComplaint, onUpdateComplaint, onDeleteComplaint }) => {
  const [view, setView] = useState<'DASHBOARD' | 'FORM' | 'HISTORY'>('DASHBOARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState<Complaint | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: session.name || '',
    studentId: session.id || '',
    dept: (session.department as unknown as StudentDept) || '',
    category: ComplaintCategory.OTHERS,
    title: '', 
    description: '',
    image: ''
  });
  const [error, setError] = useState('');

  const stats = {
    pending: complaints.filter(c => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.IN_PROGRESS).length,
    resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
    escalated: complaints.filter(c => c.escalatedToAdmin || c.escalatedToHOD).length
  };

  const recentUpdates = [...complaints]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Check for resolved complaints that need feedback
  useEffect(() => {
    const needsFeedback = complaints.find(c => c.status === ComplaintStatus.RESOLVED && !c.feedback);
    if (needsFeedback && !feedbackComplaint) {
      setFeedbackComplaint(needsFeedback);
    }
  }, [complaints, feedbackComplaint]);

  // Auto-fill name and dept based on student ID from MOCK_USERS
  useEffect(() => {
    const user = (MOCK_USERS as any)[formData.studentId];
    if (user && user.role === 'STUDENT') {
      setFormData(prev => ({ 
        ...prev, 
        name: user.name, 
        dept: user.dept as StudentDept 
      }));
    }
  }, [formData.studentId]);

  const validateStudentId = (id: string) => /^\d{12}$/.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStudentId(formData.studentId)) {
      setError('Invalid Student ID format.');
      return;
    }

    if (!formData.name || !formData.dept || !formData.title || !formData.description) {
      setError('All fields including Department are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const aiAnalysis = await classifyComplaint(formData.title, formData.description, formData.image);
      const resolvingDept = CATEGORY_ROUTING[formData.category](formData.dept as StudentDept);
      const isMentorRelated = formData.category === ComplaintCategory.MENTOR_RELATED;
      const studentDept = session.department as unknown as StudentDept;

      const newComplaint: Complaint = {
        id: `CMP-${Date.now()}`,
        studentId: session.id,
        studentName: session.name,
        studentDept,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: aiAnalysis.priority,
        status: ComplaintStatus.PENDING,
        department: resolvingDept,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        escalatedToAdmin: false,
        escalatedToHOD: isMentorRelated,
        imageUrl: formData.image || undefined,
        statusHistory: []
      };

      await onAddComplaint(newComplaint);
      setFormData({ ...formData, title: '', description: '', image: '' });
      setView('HISTORY');
    } catch (err) {
      setError('Failed to process complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = (id: string) => {
    onDeleteComplaint(id);
    setConfirmDeleteId(null);
  };

  const submitFeedback = () => {
    if (rating === 0) return alert('Please select a rating');
    if (!feedbackComplaint) return;

    const updated: Complaint = {
      ...feedbackComplaint,
      feedback: { rating, comment },
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaint(updated);
    setFeedbackComplaint(null);
    setRating(0);
    setComment('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Feedback Modal */}
      {feedbackComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="bg-blue-600 p-8 text-white relative">
              <button 
                onClick={() => setFeedbackComplaint(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <CheckCircle2 className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">Resolution Feedback</h3>
              <p className="text-blue-100 font-medium mt-1">Your grievance "{feedbackComplaint.title}" has been resolved. How was your experience?</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Rate the resolution</label>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star className={`h-10 w-10 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comments (Optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="Share your thoughts on the resolution..."
                  rows={3}
                />
              </div>
              <button 
                onClick={submitFeedback}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Student Hub</h2>
          <p className="text-slate-500 font-medium">Verified Identity: <span className="text-blue-600 font-bold">{formData.name || session.name}</span></p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setView('HISTORY')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'HISTORY' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Search className="h-4 w-4" />
            <span>History</span>
          </button>
          <button 
            onClick={() => setView('FORM')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'FORM' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Plus className="h-4 w-4" />
            <span>File New</span>
          </button>
        </div>
      </div>

      {view === 'DASHBOARD' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">{stats.pending}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Triage</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-6">
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">{stats.resolved}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved Cases</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-6">
              <div className="bg-red-50 p-4 rounded-2xl">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">{stats.escalated}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escalated Tiers</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center">
              <Zap className="h-5 w-5 mr-3 text-amber-500" />
              Recent Activity Ledger
            </h3>
            <div className="space-y-4">
              {recentUpdates.length > 0 ? (
                recentUpdates.map(update => (
                  <div key={update.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[update.status].split(' ')[0].replace('bg-', 'bg-')}`}></div>
                      <div>
                        <div className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{update.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Status: {update.status} &bull; Updated {new Date(update.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('HISTORY')}
                      className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                    >
                      <span>Audit Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No activity recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'FORM' && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 max-w-4xl mx-auto">
          <h3 className="text-2xl font-black mb-10 flex items-center text-slate-800 tracking-tighter uppercase">
            <div className="bg-blue-600 p-3 rounded-2xl mr-4 shadow-lg shadow-blue-100">
               <Send className="h-6 w-6 text-white" />
            </div>
            Grievance Redressal Form
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-4.5 h-4 w-4 text-slate-300" />
                  <input 
                    type="text" 
                    maxLength={12}
                    value={formData.studentId}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed shadow-inner"
                    placeholder="Student ID"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name (Auto-filled)</label>
                <div className="relative">
                  <User className="absolute left-4 top-4.5 h-5 w-5 text-slate-300" />
                  <input 
                    type="text" 
                    readOnly
                    value={formData.name}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed shadow-inner"
                    placeholder="Verified Student Name"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department (Mandatory Selection)</label>
                <div className="relative">
                  <Building className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
                  <select 
                    value={formData.dept}
                    onChange={(e) => setFormData({...formData, dept: e.target.value as StudentDept})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none font-bold text-slate-700"
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {STUDENT_DEPTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grievance Taxonomy</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as ComplaintCategory})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none font-bold text-slate-700"
                  >
                    {COMPLAINT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Header</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-700"
                placeholder="Concise header for the issue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Narrative</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-700"
                placeholder="Describe your grievance in detail. Precise facts enable rapid resolution."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence / Attachment (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                    <div className="flex flex-col items-center">
                      <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-600 mb-1" />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">
                        {formData.image ? 'Change Evidence' : 'Upload Evidence'}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
                {formData.image && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={formData.image} alt="Evidence Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-50 text-red-600 rounded-[1.5rem] text-sm font-bold flex items-center border border-red-100">
                <AlertTriangle className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white transition-all shadow-2xl ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {isSubmitting ? 'Analyzing Priority...' : 'Submit Grievance'}
            </button>
          </form>
        </div>
      )}

      {view === 'HISTORY' && (
        <div className="grid gap-6">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200 shadow-sm">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-xl tracking-tight uppercase">Grievance Ledger Empty</p>
              <button onClick={() => setView('FORM')} className="mt-6 px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all">File Initial Complaint</button>
            </div>
          ) : (
            complaints.map(complaint => (
              <div key={complaint.id} className="group bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[complaint.status]}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${PRIORITY_COLORS[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                    {complaint.status === ComplaintStatus.PENDING && (
                      <div className="flex items-center ml-2">
                        {confirmDeleteId === complaint.id ? (
                          <div className="flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => handleWithdraw(complaint.id)}
                              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                            >
                              Confirm Withdraw
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(complaint.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Withdraw mistakenly sent grievance"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-slate-300 font-bold ml-auto uppercase tracking-widest">Protocol {complaint.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{complaint.title}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed line-clamp-2">{complaint.description}</p>
                    {complaint.imageUrl && (
                      <div className="mt-4 w-full max-w-sm rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        <img src={complaint.imageUrl} alt="Evidence" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>

                  {complaint.feedback && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mt-2">
                      <div className="flex items-center mb-1">
                        <div className="flex mr-3">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-3 w-3 ${complaint.feedback!.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Student Rating</span>
                      </div>
                      {complaint.feedback.comment && (
                        <p className="text-[11px] text-slate-600 font-bold italic">"{complaint.feedback.comment}"</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">Resolver: {complaint.department}</span>
                    <span>Category: {complaint.category.replace('_', ' ')}</span>
                  </div>

                  {complaint.statusHistory && complaint.statusHistory.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <Clock className="h-3 w-3 mr-2" />
                        Grievance Audit Timeline
                      </div>
                      <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                        {complaint.statusHistory.map((update, idx) => (
                          <div key={idx} className="relative pl-10 group/item">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover/item:scale-110 ${STATUS_COLORS[update.status]}`}>
                              {update.status === ComplaintStatus.RESOLVED ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{update.status}</span>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">Action by {update.updatedBy}</div>
                              </div>
                              <div className="text-[9px] text-slate-400 font-black bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                {new Date(update.timestamp).toLocaleString()}
                              </div>
                            </div>
                            {update.remarks && (
                              <div className="mt-3 p-4 bg-slate-50/50 rounded-2xl text-[11px] font-bold text-slate-600 italic border border-slate-100 leading-relaxed">
                                "{update.remarks}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-10">
                  {complaint.status === ComplaintStatus.RESOLVED ? (
                    <div className="text-center bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                      <span className="text-emerald-700 font-black text-[11px] block uppercase tracking-[0.2em]">Resolved</span>
                      <div className="mt-2 text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">By {complaint.resolvedByRole}</div>
                      {!complaint.feedback && (
                        <button 
                          onClick={() => setFeedbackComplaint(complaint)}
                          className="mt-4 px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          Rate Resolution
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-10"></div>
                        <Clock className="h-10 w-10 text-blue-600 relative" />
                      </div>
                      <span className="text-slate-700 font-black text-[11px] block uppercase tracking-[0.2em]">In Triage</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-2 uppercase">Lvl: {complaint.escalatedToAdmin ? 'Admin' : complaint.escalatedToHOD ? 'HOD' : 'Mentor'}</span>
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
