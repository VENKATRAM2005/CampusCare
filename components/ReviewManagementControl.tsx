
import React, { useState, useEffect } from 'react';
import { UserSession, ReviewWindow, TeachingReview, InstitutionalReport, Role } from '../types';
import { generateInstitutionalReport } from '../services/geminiService';
import { ShieldCheck, Settings, Users, FileText, Download, Zap, AlertTriangle, CheckCircle2, X, BarChart3, Search, TrendingUp, Target } from 'lucide-react';
import Markdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

import { SUBJECTS_LIST } from '../constants';

interface ReviewManagementControlProps {
  session: UserSession;
  reviewWindow: ReviewWindow;
  reviews: TeachingReview[];
  reports: InstitutionalReport[];
  onUpdateWindow: (window: ReviewWindow) => void;
  onAddReport: (report: InstitutionalReport) => void;
}

const ReviewManagementControl: React.FC<ReviewManagementControlProps> = ({ 
  session, 
  reviewWindow, 
  reviews: allReviews, 
  reports: allReports,
  onUpdateWindow,
  onAddReport
}) => {
  type SemesterType = ReviewWindow['type'];

  // Filter data based on HOD department
  const reviews = session.role === Role.HOD 
    ? allReviews.filter(r => {
        const subject = SUBJECTS_LIST.find(s => s.code === r.subjectCode);
        return subject?.dept === session.department;
      })
    : allReviews;

  const reports = session.role === Role.HOD
    ? allReports.filter(rep => rep.semesterId.includes(session.department || '')) // Simple filtering for reports
    : allReports;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'CONTROL' | 'SUBMISSIONS' | 'REPORTS'>('CONTROL');

  const loadingMessages = [
    "Aggregating raw feedback...",
    "Running sentiment analysis...",
    "Identifying strength clusters...",
    "Detecting institutional risks...",
    "Finalizing intelligence report..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);
  const [selectedReport, setSelectedReport] = useState<InstitutionalReport | null>(null);
  const [newSemester, setNewSemester] = useState({
    year: reviewWindow.year || '',
    type: (reviewWindow.type || 'ODD') as SemesterType
  });

  // Sync state if props change
  useEffect(() => {
    setNewSemester({
      year: reviewWindow.year || '',
      type: (reviewWindow.type || 'ODD') as SemesterType
    });
  }, [reviewWindow.year, reviewWindow.type]);

  const toggleWindow = () => {
    if (!reviewWindow.semesterId) return alert('Please configure the semester first.');
    
    onUpdateWindow({
      ...reviewWindow,
      isOpen: !reviewWindow.isOpen,
      [reviewWindow.isOpen ? 'closedAt' : 'openedAt']: new Date().toISOString()
    });
  };

  const filteredReports = reports.filter(r => {
    if (session.role === Role.HOD) {
      return r.department === session.department;
    }
    return true;
  });

  const filteredReviews = reviews.filter(r => {
    if (session.role === Role.HOD) {
      const subject = SUBJECTS_LIST.find(s => s.code === r.subjectCode);
      return subject?.dept === session.department;
    }
    return true;
  });

  const handleUpdateSemester = () => {
    if (!newSemester.year.trim()) return alert('Please enter the academic year.');
    
    onUpdateWindow({
      ...reviewWindow,
      year: newSemester.year,
      type: newSemester.type,
      semesterId: `${newSemester.year}-${newSemester.type}`
    });
    alert('Semester configuration updated.');
  };

  const handleGenerateReport = async () => {
    if (reviewWindow.isOpen) return alert('Please close the review window first.');
    
    // Filter reviews to only include the HOD's department if applicable
    const targetReviews = session.role === Role.HOD 
      ? reviews.filter(r => {
          const subject = SUBJECTS_LIST.find(s => s.code === r.subjectCode);
          return subject?.dept === session.department;
        })
      : reviews;

    if (targetReviews.length === 0) return alert('No submission data available for this department.');

    setIsGenerating(true);
    try {
      const reportPromise = generateInstitutionalReport(targetReviews, session.role === Role.HOD ? session.department : undefined);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 60000)
      );

      const content = await Promise.race([reportPromise, timeoutPromise]);
      
      const weightedSum = targetReviews.reduce((acc, r) => acc + (r.overallScore * r.moderation.weightAdjustmentFactor), 0);
      const totalWeight = targetReviews.reduce((acc, r) => acc + r.moderation.weightAdjustmentFactor, 0);
      const avgRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
      
      const deptStats: Record<string, number> = {};
      const deptCounts: Record<string, number> = {};
      const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      targetReviews.forEach(r => {
        const subject = SUBJECTS_LIST.find(s => s.code === r.subjectCode);
        const dept = subject?.dept || 'UNKNOWN';
        deptStats[dept] = (deptStats[dept] || 0) + r.overallScore;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        
        const roundedScore = Math.round(r.overallScore);
        if (roundedScore >= 1 && roundedScore <= 5) {
          scoreDistribution[roundedScore]++;
        }
      });
      
      Object.keys(deptStats).forEach(dept => {
        deptStats[dept] = deptStats[dept] / deptCounts[dept];
      });
      
      const newReport: InstitutionalReport = {
        id: `REP-${Date.now()}`,
        semesterId: session.role === Role.HOD ? `${reviewWindow.semesterId}-${session.department}` : reviewWindow.semesterId,
        department: session.role === Role.HOD ? session.department : 'INSTITUTIONAL',
        generatedAt: new Date().toISOString(),
        content,
        stats: {
          totalSubmissions: targetReviews.length,
          averageRating: avgRating,
          deptStats,
          scoreDistribution
        }
      };
      onAddReport(newReport);
      setSelectedReport(newReport);
      setActiveTab('REPORTS');
    } catch (err) {
      if (err instanceof Error && err.message === 'TIMEOUT') {
        alert('Report generation timed out (exceeded 60s). Please try again.');
      } else {
        alert('Failed to generate AI report.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (report: InstitutionalReport) => {
    setIsDownloading(true);
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const blob = new Blob([report.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Institutional_Report_${report.semesterId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('CONTROL')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CONTROL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}
        >
          Window Control
        </button>
        <button 
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SUBMISSIONS' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
        >
          Raw Submissions
        </button>
        <button 
          onClick={() => setActiveTab('REPORTS')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REPORTS' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
        >
          AI Reports
        </button>
      </div>

      {activeTab === 'CONTROL' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center">
              <Settings className="h-5 w-5 mr-3 text-slate-400" /> {session.role === Role.HOD ? `${session.department} Dept` : 'Institutional'} Review Window
            </h4>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                  <input 
                    type="text"
                    value={newSemester.year}
                    onChange={(e) => setNewSemester({...newSemester, year: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={newSemester.type}
                    onChange={(e) => setNewSemester({...newSemester, type: e.target.value as SemesterType})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
                  >
                    <option value="ODD">ODD</option>
                    <option value="EVEN">EVEN</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleUpdateSemester}
                disabled={reviewWindow.isOpen}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Update Semester Config
              </button>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Semester</div>
                  <div className="text-xl font-black text-slate-900">{reviewWindow.semesterId}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${reviewWindow.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {reviewWindow.isOpen ? 'LIVE' : 'INACTIVE'}
                </div>
              </div>

              <button 
                onClick={toggleWindow}
                disabled={!reviewWindow.semesterId}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-3 ${!reviewWindow.semesterId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : reviewWindow.isOpen ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
              >
                {reviewWindow.isOpen ? <X className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                <span>{reviewWindow.isOpen ? 'Close Review Window' : 'Enable Review Window'}</span>
              </button>

              {!reviewWindow.semesterId && (
                <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 animate-pulse">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">Semester configuration is required before enabling the window.</p>
                </div>
              )}
              
              <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
                Closing the window locks student submissions and enables AI reporting.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap className="h-32 w-32" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-blue-400 flex items-center">
              <Zap className="h-5 w-5 mr-3" /> {session.role === Role.HOD ? `${session.department} Dept` : 'Institutional'} Intelligence
            </h4>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Data Points</div>
                  <div className="text-2xl font-black">{reviews.length}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Flagged Content</div>
                  <div className="text-2xl font-black text-red-400">{reviews.filter(r => r.moderation.isFlagged).length}</div>
                </div>
              </div>
              
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating || reviewWindow.isOpen}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-3 ${isGenerating || reviewWindow.isOpen ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900'}`}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 animate-pulse text-blue-400" />
                    <span className="animate-pulse">{loadingMessages[loadingStep]}</span>
                  </div>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Generate {session.role === Role.HOD ? 'Departmental' : 'Institutional'} Report</span>
                  </>
                )}
              </button>
              
              {reviewWindow.isOpen && (
                <div className="flex items-center space-x-2 text-amber-400 bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Window must be closed to generate final report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SUBMISSIONS' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
              <Users className="h-5 w-5 mr-3 text-slate-400" /> Raw Submission Audit
            </h4>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
              Total: {filteredReviews.length} Submissions
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Student Identity</th>
                  <th className="px-8 py-4">Mentor</th>
                  <th className="px-8 py-4">Subject</th>
                  <th className="px-8 py-4">Score</th>
                  <th className="px-8 py-4">AI Moderation</th>
                  <th className="px-8 py-4">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{r.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.studentId}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-700">{r.mentorName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-slate-500">{r.subjectCode}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${r.overallScore >= 4 ? 'bg-emerald-100 text-emerald-700' : r.overallScore >= 3 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {r.overallScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {r.moderation.isFlagged && (
                          <span className="flex items-center text-red-600 text-[9px] font-black uppercase tracking-widest">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Flagged
                          </span>
                        )}
                        {r.moderation.biasDetected && (
                          <span className="flex items-center text-amber-600 text-[9px] font-black uppercase tracking-widest">
                            <Zap className="h-3 w-3 mr-1" /> Bias Detected
                          </span>
                        )}
                        {!r.moderation.isFlagged && !r.moderation.biasDetected && (
                          <span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">Clean</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-black text-slate-900">{(r.moderation.weightAdjustmentFactor * 100).toFixed(0)}%</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Impact Factor</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-3 text-slate-400" /> Report Archive
            </h4>
            {filteredReports.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No reports generated</p>
              </div>
            ) : (
              filteredReports.map(rep => (
                <button 
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`w-full p-6 rounded-2xl border text-left transition-all ${selectedReport?.id === rep.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-900 hover:border-emerald-200'}`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Semester: {rep.semesterId}</div>
                  <div className="font-black text-sm mt-1">Institutional Audit Report</div>
                  <div className="text-[9px] font-bold mt-3 opacity-60">{new Date(rep.generatedAt).toLocaleString()}</div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{session.role === Role.HOD ? 'Departmental' : 'Institutional'} Performance Report</h3>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Semester: {selectedReport.semesterId}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isDownloading && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 animate-pulse">
                        Generating Download Link...
                      </span>
                    )}
                    {showDownloadSuccess && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Download Started
                      </span>
                    )}
                    <button 
                      onClick={() => handleDownloadReport(selectedReport)}
                      disabled={isDownloading}
                      className={`p-3 rounded-xl transition-all flex items-center space-x-2 ${isDownloading ? 'bg-white/10 text-white/50' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                    >
                      {isDownloading ? (
                        <Zap className="h-6 w-6 animate-spin" />
                      ) : (
                        <Download className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-10 prose prose-slate max-w-none">
                  <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Sample</div>
                      <div className="text-2xl font-black text-slate-900">{selectedReport.stats.totalSubmissions}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Avg</div>
                      <div className="text-2xl font-black text-slate-900">{selectedReport.stats.averageRating.toFixed(2)}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</div>
                      <div className="text-2xl font-black text-emerald-600">98%</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" /> Departmental Benchmarking
                      </h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(selectedReport.stats.deptStats).map(([name, avg]) => ({ name, avg }))}>
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 5]} fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#F8FAFC' }}
                            />
                            <Bar dataKey="avg" fill="#10B981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-blue-500" /> Score Distribution
                      </h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={Object.entries(selectedReport.stats.scoreDistribution).map(([star, count]) => ({
                                name: `${star} Star`,
                                value: count
                              }))} 
                              innerRadius={50} 
                              outerRadius={80} 
                              paddingAngle={5} 
                              dataKey="value"
                            >
                              {['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="markdown-body">
                    <Markdown>{selectedReport.content}</Markdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Search className="h-16 w-16 text-slate-200 mb-6" />
                <p className="text-slate-400 font-black text-xl uppercase tracking-tighter">Select a report to view analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementControl;
