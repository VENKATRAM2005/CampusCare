
import React from 'react';
import { TeachingReview } from '../types';
import { MENTORS_LIST } from '../constants';
import { Star, Building2, User, Award, BarChart3 } from 'lucide-react';

interface PublicMentorStatsProps {
  reviews: TeachingReview[];
  department?: string;
}

const PublicMentorStats: React.FC<PublicMentorStatsProps> = ({ reviews, department }) => {
  const filteredMentors = department 
    ? MENTORS_LIST.filter(m => m.dept === department)
    : MENTORS_LIST;

  const mentorStats = filteredMentors.map(mentor => {
    const mentorReviews = reviews.filter(r => r.mentorId === mentor.id);
    const weightedSum = mentorReviews.reduce((acc, r) => acc + (r.overallScore * r.moderation.weightAdjustmentFactor), 0);
    const totalWeight = mentorReviews.reduce((acc, r) => acc + r.moderation.weightAdjustmentFactor, 0);
    const avg = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    const questionAvgs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(idx => {
      return mentorReviews.length > 0 
        ? mentorReviews.reduce((acc, r) => acc + r.ratings[idx], 0) / mentorReviews.length 
        : 0;
    });
    
    return {
      ...mentor,
      avg,
      count: mentorReviews.length,
      questionAvgs
    };
  }).sort((a, b) => b.avg - a.avg);

  const deptStats = Array.from(new Set(filteredMentors.map(m => m.dept))).map(dept => {
    const deptReviews = reviews.filter(r => {
      const mentor = MENTORS_LIST.find(m => m.id === r.mentorId);
      return mentor?.dept === dept;
    });
    const weightedSum = deptReviews.reduce((acc, r) => acc + (r.overallScore * r.moderation.weightAdjustmentFactor), 0);
    const totalWeight = deptReviews.reduce((acc, r) => acc + r.moderation.weightAdjustmentFactor, 0);
    const avg = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    return { dept, avg };
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-3 gap-8">
        {deptStats.map(stat => (
          <div key={stat.dept} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.dept} Department</div>
              <div className="text-3xl font-black text-slate-900">{stat.avg.toFixed(2)}</div>
              <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Global Average</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{department ? `${department} Dept` : 'Institutional'} Mentor Rankings</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Transparency Ledger</p>
          </div>
          <BarChart3 className="h-8 w-8 text-slate-200" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-10">
          {mentorStats.map((mentor, idx) => (
            <div key={mentor.id} className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative">
              {idx < 3 && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-2 rounded-xl shadow-lg">
                  <Award className="h-5 w-5" />
                </div>
              )}
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <User className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">{mentor.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mentor.dept}</p>
                </div>
              </div>

              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${mentor.avg >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Based on {mentor.count} reviews</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">{mentor.avg > 0 ? mentor.avg.toFixed(2) : 'N/A'}</div>
                  <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Rating</div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Criteria Performance</div>
                <div className="flex flex-wrap gap-1">
                  {mentor.questionAvgs.map((qAvg, i) => (
                    <div key={i} className="px-2 py-1 bg-white rounded-md border border-slate-100 text-[8px] font-bold text-slate-600">
                      Q{i+1}: {qAvg.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-8 bg-slate-900 rounded-[2rem] text-center">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Data is anonymized and aggregated to protect student identity and maintain institutional integrity.
        </p>
      </div>
    </div>
  );
};

export default PublicMentorStats;
