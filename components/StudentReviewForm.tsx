
import React, { useState, useEffect } from 'react';
import { UserSession, ReviewWindow, TeachingReview, Role, Priority } from '../types';
import { TEACHING_REVIEW_QUESTIONS, MENTORS_LIST, SUBJECTS_LIST, STUDENT_SUBJECT_MAPPING } from '../constants';
import { hasStudentSubmitted } from '../services/storageService';
import { moderateFeedback } from '../services/geminiService';
import { Star, Send, AlertTriangle, CheckCircle2, Lock, User, BookOpen, MessageSquare, GraduationCap, Info } from 'lucide-react';

interface StudentReviewFormProps {
  session: UserSession;
  reviewWindow: ReviewWindow;
  onAddReview: (review: TeachingReview) => void;
  onClose?: () => void;
}

const StudentReviewForm: React.FC<StudentReviewFormProps> = ({ session, reviewWindow, onAddReview, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    mentorId: '',
    subjectCode: '',
    ratings: new Array(10).fill(0),
    writtenFeedback: ''
  });

  const studentSubjects = STUDENT_SUBJECT_MAPPING[session.id] || [];
  const filteredSubjects = SUBJECTS_LIST.filter(s => 
    s.dept === session.department && 
    studentSubjects.includes(s.code)
  );

  const handleSubjectChange = (code: string) => {
    const subject = SUBJECTS_LIST.find(s => s.code === code);
    setFormData({
      ...formData,
      subjectCode: code,
      mentorId: subject?.mentorId || ''
    });
  };

  const isMentorSubmitted = formData.mentorId ? hasStudentSubmitted(session.id, formData.mentorId, reviewWindow.semesterId) : false;

  if (showSuccess) {
    return (
      <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
        <div className="bg-emerald-100 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Review Submitted</h3>
        <p className="text-slate-500 mt-4 font-bold leading-relaxed">
          Your feedback has been securely logged. This review is now <span className="text-emerald-600">locked and immutable</span> for audit integrity.
        </p>
        <div className="mt-10">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!reviewWindow.isOpen) {
    return (
      <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
        <Lock className="h-16 w-16 text-slate-200 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Review Window Closed</h3>
        <p className="text-slate-400 mt-2 font-medium">Submissions are currently disabled by the administration.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 rounded-[3rem] p-20 text-center border border-emerald-100 shadow-xl shadow-emerald-50/50">
        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
        <h3 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Submission Locked</h3>
        <p className="text-emerald-700 mt-2 font-bold">You have already completed your teaching review for {reviewWindow.semesterId}.</p>
        <div className="mt-8 inline-block px-6 py-2 bg-white rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
          Protocol: One Submission Per Semester
        </div>
      </div>
    );
  }

  const handleRatingChange = (index: number, value: number) => {
    const newRatings = [...formData.ratings];
    newRatings[index] = value;
    setFormData({ ...formData, ratings: newRatings });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.mentorId || !formData.subjectCode) {
      return setError('Please select both Mentor and Subject.');
    }

    if (formData.ratings.some(r => r === 0)) {
      return setError('Please provide ratings for all 10 criteria.');
    }

    if (formData.writtenFeedback.length < 5) {
      return setError('Written feedback must be at least 5 characters.');
    }

    if (formData.writtenFeedback.length > 250) {
      return setError('Written feedback must be maximum 250 characters.');
    }

    if (isMentorSubmitted) {
      return setError('You have already submitted a review for this mentor this semester.');
    }

    setIsSubmitting(true);
    try {
      // AI Moderation
      const moderation = await moderateFeedback(formData.writtenFeedback, formData.ratings);
      
      const mentor = MENTORS_LIST.find(m => m.id === formData.mentorId);
      const subject = SUBJECTS_LIST.find(s => s.code === formData.subjectCode);
      
      const overallScore = formData.ratings.reduce((a, b) => a + b, 0) / 10;

      const newReview: TeachingReview = {
        id: `REV-${Date.now()}`,
        studentId: session.id,
        studentName: session.name,
        semesterId: reviewWindow.semesterId,
        mentorId: formData.mentorId,
        mentorName: mentor?.name || 'Unknown',
        subjectCode: formData.subjectCode,
        subjectName: subject?.name || 'Unknown',
        ratings: formData.ratings,
        overallScore,
        writtenFeedback: formData.writtenFeedback,
        moderation,
        timestamp: new Date().toISOString(),
        hash: btoa(`${session.id}-${formData.mentorId}-${reviewWindow.semesterId}-${Date.now()}`)
      };

      onAddReview(newReview);
      setFormData({
        mentorId: '',
        subjectCode: '',
        ratings: new Array(10).fill(0),
        writtenFeedback: ''
      });
      setShowSuccess(true);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 max-w-5xl mx-auto">
      <div className="flex items-center mb-10">
        <div className="bg-emerald-600 p-4 rounded-2xl mr-5 shadow-lg shadow-emerald-100">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Teaching Performance Review</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Semester: {reviewWindow.semesterId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
              <select 
                value={formData.subjectCode}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none transition-all appearance-none font-bold text-slate-700"
                required
              >
                <option value="">Choose Subject</option>
                {filteredSubjects.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Mentor</label>
            <div className="relative">
              <User className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                readOnly
                value={formData.mentorId ? `${formData.mentorId} - ${MENTORS_LIST.find(m => m.id === formData.mentorId)?.name || 'Unknown'}` : 'Select a subject first'}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {isMentorSubmitted ? (
          <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Review Already Logged</h3>
            <p className="text-slate-500 mt-3 font-bold max-w-sm mx-auto">
              Your evaluation for this mentor is already part of the immutable audit trail for {reviewWindow.semesterId}.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="px-6 py-2 bg-white rounded-full text-[9px] font-black text-red-600 uppercase tracking-widest border border-red-100">
                Protocol: One Submission Per Semester
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-4">Evaluation Criteria (Scale 1-5)</h4>
              <div className="grid gap-6">
                {TEACHING_REVIEW_QUESTIONS.map((q, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-sm font-bold text-slate-700 mb-4 md:mb-0 md:mr-8">{idx + 1}. {q}</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRatingChange(idx, val)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${formData.ratings[idx] === val ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-300'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualitative Feedback (5-250 chars)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4.5 h-5 w-5 text-slate-300" />
                <textarea 
                  rows={4}
                  maxLength={250}
                  value={formData.writtenFeedback}
                  onChange={(e) => setFormData({...formData, writtenFeedback: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="Describe your learning experience with this mentor..."
                ></textarea>
                <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  {formData.writtenFeedback.length}/250
                </div>
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
              className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white transition-all shadow-2xl ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
            >
              {isSubmitting ? 'AI Moderating...' : 'Finalize & Lock Submission'}
            </button>
            <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Warning: Submissions are immutable and logged for audit.
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default StudentReviewForm;
