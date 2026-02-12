
import React from 'react';
import { Complaint, ComplaintStatus, Role, ComplaintCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { AlertCircle, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';

interface AnalyticsProps {
  complaints: Complaint[];
}

const Analytics: React.FC<AnalyticsProps> = ({ complaints }) => {
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
  const escalated = complaints.filter(c => c.escalatedToAdmin).length;
  const highPriority = complaints.filter(c => c.priority === 'HIGH').length;

  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const escRate = total > 0 ? Math.round((escalated / total) * 100) : 0;

  // Pie Chart Data: Status Distribution
  const statusData = [
    { name: 'Pending', value: complaints.filter(c => c.status === ComplaintStatus.PENDING).length },
    { name: 'In Progress', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length },
    { name: 'Resolved', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length },
    { name: 'Escalated', value: complaints.filter(c => c.status === ComplaintStatus.ESCALATED).length },
  ].filter(d => d.value > 0);

  const COLORS = ['#FBBF24', '#3B82F6', '#10B981', '#EF4444'];

  // Bar Chart Data: Category Trends
  const categoryData = Object.values(ComplaintCategory).map(cat => ({
    name: cat.replace('_', ' '),
    count: complaints.filter(c => c.category === cat).length
  }));

  // Resolve by Role Data
  const resolvedByRole = [
    { name: 'Staff', count: complaints.filter(c => c.resolvedByRole === Role.STAFF).length },
    { name: 'Admin', count: complaints.filter(c => c.resolvedByRole === Role.ADMIN).length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Grievances</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-4xl font-black text-slate-900">{total}</div>
          <div className="mt-2 text-[10px] text-slate-400 font-bold">LIFETIME COUNT</div>
        </div>

        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">High Priority</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-4xl font-black text-red-600">{highPriority}</div>
          <div className="mt-2 text-[10px] text-red-400 font-bold">URGENT INTERVENTION</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Rate</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-4xl font-black text-emerald-600">{resRate}%</div>
          <div className="mt-2 text-[10px] text-slate-400 font-bold">SUCCESS METRIC</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escalation Rate</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-4xl font-black text-white">{escRate}%</div>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">ADMIN BURDEN</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-8">Status Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-8">Category Trends</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-8">Resolution Ownership</h4>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={resolvedByRole} layout="vertical">
                 <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                 <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} />
                 <Tooltip />
                 <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-pulse" />
            <h5 className="text-xl font-black text-slate-900 uppercase">Executive Oversight</h5>
            <p className="text-slate-500 max-w-xs mt-2">
              Ensuring 100% grievance transparency and hierarchical accountability across all departments.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
