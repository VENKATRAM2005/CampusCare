
import React, { useState, useEffect } from 'react';
import { UserSession, TeachingReview, ReviewWindow } from '../types';
import { TEACHING_REVIEW_QUESTIONS, SUBJECTS_LIST } from '../constants';
import { generateMentorSummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Award, MessageSquare, AlertCircle, Zap, Target, Star, BrainCircuit } from 'lucide-react';

interface MentorAnalyticsProps {
  session: UserSession;
  reviews: TeachingReview[];
  reviewWindow: ReviewWindow;
}

const MentorAnalytics: React.FC<MentorAnalyticsProps> = ({ session, reviews, reviewWindow }) => {
  const [summary, setSummary] = useState<{ strengths: string; improvements: string } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const myReviews = reviews.filter(r => r.mentorId === session.id && r.semesterId === reviewWindow.semesterId);
  const totalReviews = myReviews.length;

  useEffect(() => {
    const fetchSummary = async () => {
      if (myReviews.length >= 3 && !summary && !loadingSummary) {
        setLoadingSummary(true);
        try {
          const res = await generateMentorSummary(myReviews);
          setSummary(res);
        } catch (err) {
          console.error("Failed to generate summary", err);
        } finally {
          setLoadingSummary(false);
        }
      }
    };
    fetchSummary();
  }, [myReviews.length, summary]);

  if (totalReviews === 0) {
    return (
      <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
        <Target className="h-16 w-16 text-slate-200 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Review Data Yet</h3>
        <p className="text-slate-400 mt-2 font-medium">Analytics will populate once students complete your evaluation.</p>
      </div>
    );
  }

  // Calculate Stats
  const weightedSum = myReviews.reduce((acc, r) => acc + (r.overallScore * r.moderation.weightAdjustmentFactor), 0);
  const totalWeight = myReviews.reduce((acc, r) => acc + r.moderation.weightAdjustmentFactor, 0);
  const overallAvg = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  const questionAvgs = TEACHING_REVIEW_QUESTIONS.map((q, idx) => {
    const qWeightedSum = myReviews.reduce((acc, r) => acc + (r.ratings[idx] * r.moderation.weightAdjustmentFactor), 0);
    return {
      name: `Q${idx + 1}`,
      full: q,
      avg: totalWeight > 0 ? qWeightedSum / totalWeight : 0
    };
  });

  const distribution = [1, 2, 3, 4, 5].map(val => ({
    rating: val,
    count: myReviews.filter(r => Math.round(r.overallScore) === val).length
  }));

  // Filter reviews for the current department only
  const deptReviews = reviews.filter(r => {
    const subject = SUBJECTS_LIST.find(s => s.code === r.subjectCode);
    return subject?.dept === session.department;
  });

  // Calculate Dynamic Rank within Department
  const mentorScoresWithIds = Array.from(new Set(deptReviews.map(r => r.mentorId))).map(mId => {
    const mReviews = deptReviews.filter(r => r.mentorId === mId && r.semesterId === reviewWindow.semesterId);
    if (mReviews.length === 0) return { id: mId, score: 0 };
    const wSum = mReviews.reduce((acc, r) => acc + (r.overallScore * r.moderation.weightAdjustmentFactor), 0);
    const tWeight = mReviews.reduce((acc, r) => acc + r.moderation.weightAdjustmentFactor, 0);
    return { id: mId, score: tWeight > 0 ? wSum / tWeight : 0 };
  }).filter(m => m.score > 0).sort((a, b) => b.score - a.score); // Sort descending (highest score first)

  const myRank = mentorScoresWithIds.findIndex(m => m.id === session.id) + 1;
  const totalMentors = mentorScoresWithIds.length;

  const historicalTrend = [
    { semester: '2025-ODD', score: 4.2 },
    { semester: '2025-EVEN', score: 4.5 },
    { semester: '2026-ODD', score: overallAvg }
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {overallAvg < 3 && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center text-red-700 animate-pulse">
          <AlertCircle className="h-8 w-8 mr-6" />
          <div>
            <div className="font-black uppercase text-xs tracking-widest">Performance Alert</div>
            <p className="text-sm font-medium">Your overall rating is below the institutional threshold (3.0). Please review the improvement areas.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Score</span>
          </div>
          <div className="text-5xl font-black text-slate-900">{overallAvg.toFixed(2)}</div>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Performance Rating</div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-6 w-6 text-blue-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departmental Rank</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-white">{myRank}</span>
            <span className="text-xl font-bold text-slate-500">of {totalMentors}</span>
          </div>
          <div className="mt-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">Dept Standing</div>
        </div>

        <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Reviews</span>
          </div>
          <div className="text-5xl font-black text-blue-900">{totalReviews}</div>
          <div className="mt-2 text-[10px] text-blue-600 font-bold uppercase tracking-widest">Student Submissions</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center">
            <Zap className="h-5 w-5 mr-3 text-amber-500" /> Criteria-wise Breakdown
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionAvgs}>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="avg" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {questionAvgs.map((q, i) => (
              <div key={i} className="text-[9px] text-slate-400 font-bold uppercase truncate" title={q.full}>
                {q.name}: {q.full}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center">
            <Target className="h-5 w-5 mr-3 text-blue-500" /> Rating Distribution
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={distribution} 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <BrainCircuit className="h-40 w-40" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 flex items-center">
                <BrainCircuit className="h-5 w-5 mr-3" /> AI Performance Insights
              </h4>
              {summary && (
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  Analysis Complete
                </span>
              )}
            </div>

            {myReviews.length < 3 ? (
              <div className="py-12 text-center">
                <BrainCircuit className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Awaiting more feedback (min. 3) for AI analysis
                </p>
              </div>
            ) : loadingSummary ? (
              <div className="space-y-8 animate-pulse">
                <div className="space-y-3">
                  <div className="h-2 w-24 bg-slate-800 rounded"></div>
                  <div className="h-20 bg-slate-800 rounded-2xl w-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-32 bg-slate-800 rounded"></div>
                  <div className="h-20 bg-slate-800 rounded-2xl w-full"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="relative pl-6 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Institutional Strengths</h5>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                    "{summary?.strengths}"
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-amber-500/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                  <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">Strategic Growth Areas</h5>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                    "{summary?.improvements}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center">
            <TrendingUp className="h-5 w-5 mr-3 text-emerald-500" /> Historical Trend
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalTrend}>
                <XAxis dataKey="semester" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="score" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center">
            <MessageSquare className="h-5 w-5 mr-3 text-slate-400" /> Anonymized Student Feedback
          </h4>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {myReviews.filter(r => !r.moderation.isFlagged).map((r, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm font-medium leading-relaxed">
                "{r.writtenFeedback}"
                <div className="mt-3 flex items-center justify-between">
                   <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${r.overallScore >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                   </div>
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Verified Submission</span>
                </div>
              </div>
            ))}
            {myReviews.some(r => r.moderation.isFlagged) && (
              <div className="p-4 bg-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                Some feedback hidden due to moderation flags
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAnalytics;
