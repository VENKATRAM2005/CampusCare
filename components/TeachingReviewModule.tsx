
import React, { useState } from 'react';
import { UserSession, ReviewWindow, TeachingReview, InstitutionalReport, Role } from '../types';
import StudentReviewForm from './StudentReviewForm';
import MentorAnalytics from './MentorAnalytics';
import ReviewManagementControl from './ReviewManagementControl';
import PublicMentorStats from './PublicMentorStats';
import { GraduationCap, BarChart3, ShieldCheck, Globe, ArrowLeft, Send } from 'lucide-react';

interface TeachingReviewModuleProps {
  session: UserSession;
  reviewWindow: ReviewWindow;
  reviews: TeachingReview[];
  reports?: InstitutionalReport[];
  onUpdateWindow?: (window: ReviewWindow) => void;
  onAddReview?: (review: TeachingReview) => void;
  onAddReport?: (report: InstitutionalReport) => void;
}

const TeachingReviewModule: React.FC<TeachingReviewModuleProps> = ({ 
  session, 
  reviewWindow, 
  reviews, 
  reports = [],
  onUpdateWindow,
  onAddReview,
  onAddReport
}) => {
  const [view, setView] = useState<'MAIN' | 'PUBLIC'>('MAIN');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const studentSubmissions = reviews.filter(r => r.studentId === session.id && r.semesterId === reviewWindow.semesterId);
  const hasPendingReviews = session.role === Role.STUDENT; // Simplified check

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Semester Teaching Review
          </h2>
          <div className="flex items-center mt-1 space-x-3 font-bold">
            <span className="text-slate-400">Academic Quality Assurance</span>
            <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest ${reviewWindow.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              Window: {reviewWindow.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] shadow-inner">
          <button 
            onClick={() => setView('MAIN')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'MAIN' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500'}`}
          >
            {session.role === Role.HOD ? 'Control Center' : 'My Dashboard'}
          </button>
          <button 
            onClick={() => setView('PUBLIC')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'PUBLIC' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500'}`}
          >
            Public Stats
          </button>
        </div>
      </div>

      {view === 'PUBLIC' ? (
        <PublicMentorStats reviews={reviews} department={session.department} />
      ) : (
        <>
          {session.role === Role.STUDENT && (
            <>
              {!isFormOpen ? (
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-emerald-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <GraduationCap className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    Academic Quality Assurance
                  </h3>
                  <p className="text-slate-500 mt-3 font-medium max-w-md mx-auto mb-10">
                    Your feedback is vital for institutional growth. Share your learning experience for the current semester.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setIsFormOpen(true)}
                      disabled={!reviewWindow.isOpen}
                      className={`group relative px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all shadow-2xl flex items-center ${!reviewWindow.isOpen ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:-translate-y-1'}`}
                    >
                      <Send className="h-4 w-4 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Submit Your Review
                    </button>
                    
                    <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Submissions</div>
                      <div className="text-xl font-black text-slate-900">{studentSubmissions.length} Completed</div>
                    </div>
                  </div>

                  {!reviewWindow.isOpen && (
                    <p className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest">
                      The review window is currently closed.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="flex items-center text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </button>
                  <StudentReviewForm 
                    session={session} 
                    reviewWindow={reviewWindow} 
                    onAddReview={onAddReview!} 
                    onClose={() => setIsFormOpen(false)}
                  />
                </div>
              )}
            </>
          )}
          {session.role === Role.MENTOR && (
            <MentorAnalytics 
              session={session} 
              reviews={reviews} 
              reviewWindow={reviewWindow}
            />
          )}
          {session.role === Role.HOD && (
            <ReviewManagementControl 
              session={session} 
              reviewWindow={reviewWindow} 
              reviews={reviews}
              reports={reports}
              onUpdateWindow={onUpdateWindow!}
              onAddReport={onAddReport!}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TeachingReviewModule;
