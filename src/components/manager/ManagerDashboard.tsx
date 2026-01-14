
import React, { useMemo, useState } from 'react';
import { User, TimeEntry, EntryStatus, Task } from '../../types';
import { Users, ClipboardCheck, AlertCircle, TrendingUp, Search, Info, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface ManagerDashboardProps {
  user: User;
  users: User[];
  entries: TimeEntry[];
  tasks: Task[];
  onViewEmployee: (id: string) => void;
}

const COLORS = [
  '#EA5B0C', // Orange (Brand)
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#7C3AED', // Violet
  '#4B5563', // Gray
];

function getStableColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, users, entries, tasks, onViewEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const divisionEmployees = useMemo(() => {
    return users.filter(u => u.divisionId === user.divisionId && u.id !== user.id);
  }, [users, user.divisionId, user.id]);

  const filteredEmployees = useMemo(() => {
    return divisionEmployees.filter(emp => 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [divisionEmployees, searchTerm]);
  
  const activeSyncsCount = useMemo(() => {
    return divisionEmployees.filter(emp => 
      entries.some(e => e.userId === emp.id && e.hours > 0)
    ).length;
  }, [divisionEmployees, entries]);

  const totalDivisionHours = entries
    .filter(e => divisionEmployees.some(emp => emp.id === e.userId))
    .reduce((acc, curr) => acc + curr.hours, 0);

  const divisionTaskStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.filter(e => divisionEmployees.some(emp => emp.id === e.userId))
           .forEach(e => {
             if (e.taskId) {
               stats[e.taskId] = (stats[e.taskId] || 0) + e.hours;
             }
           });
    
    return Object.entries(stats)
      .map(([taskId, hours]) => {
        const task = tasks.find(t => t.id === taskId);
        return {
          name: task?.name || 'Unknown',
          hours,
          id: taskId
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [entries, divisionEmployees, tasks]);

  const utilizationData = useMemo(() => {
    return filteredEmployees.map(emp => {
      const empEntries = entries.filter(e => e.userId === emp.id);
      const taskTotals: Record<string, number> = {};
      empEntries.forEach(e => { taskTotals[e.taskId] = (taskTotals[e.taskId] || 0) + e.hours; });
      const sortedTasks = Object.entries(taskTotals).sort((a, b) => b[1] - a[1]);
      const totalHours = empEntries.reduce((s, e) => s + e.hours, 0);
      const utilizationPercent = Math.min((totalHours / 40) * 100, 100);
      const distribution = sortedTasks.map(([taskId, hours]) => ({
        taskId, relativePercent: totalHours > 0 ? (hours / totalHours) * 100 : 0, color: getStableColor(taskId)
      }));
      const topTaskId = sortedTasks[0]?.[0];
      const topTask = topTaskId ? tasks.find(t => t.id === topTaskId) : undefined;
      const topTaskHours = sortedTasks[0]?.[1] || 0;
      const topTaskColor = topTaskId ? getStableColor(topTaskId) : COLORS[7];
      return { ...emp, utilizationPercent, totalHours, distribution, topTaskName: topTask?.name, topTaskHours, topTaskColor };
    });
  }, [filteredEmployees, entries, tasks]);

  const highUtilizationCount = useMemo(() => {
     return divisionEmployees.filter(emp => {
        const empEntries = entries.filter(e => e.userId === emp.id);
        const currentWeek = getWeekNumber(new Date());
        const targetWeeks = [currentWeek - 3, currentWeek - 2, currentWeek - 1, currentWeek];
        return targetWeeks.some(w => {
           const weekTotal = empEntries.filter(e => getWeekNumber(new Date(e.date)) === w).reduce((s, e) => s + e.hours, 0);
           return weekTotal > 40;
        });
     }).length;
  }, [divisionEmployees, entries]);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">Oversight Hub</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time resource verification and utilization metrics.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm transition-all focus-within:border-[#EA5B0C]/40 focus-within:shadow-lg focus-within:shadow-[#EA5B0C]/5 w-full lg:w-auto">
           <Search size={18} className="text-gray-300 ml-1" />
           <input type="text" placeholder="Search personnel..." className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none w-full lg:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        <SummaryCard icon={<Users className="text-orange-600" size={24} />} label="Team Capacity" value={divisionEmployees.length.toString()} color="orange" />
        <SummaryCard icon={<ClipboardCheck className="text-emerald-600" size={24} />} label="Active Syncs" value={activeSyncsCount.toString()} color="emerald" description="Count of personnel who have logged hours in the current tracking period." />
        <SummaryCard icon={<TrendingUp className="text-indigo-600" size={24} />} label="Division Workload" value={`${totalDivisionHours}h`} color="indigo" />
        <SummaryCard icon={<AlertCircle className="text-rose-600" size={24} />} label="High Utilization" value={highUtilizationCount.toString() + " Assets"} color="rose" description="Resources tracking >100% capacity (over 40h/week) in the visible period." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col h-[400px] lg:h-[500px]">
           <div className="p-8 border-b border-gray-50 flex flex-col shrink-0">
               <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Task Impact</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Top allocated activities by volume</p>
           </div>
           <div className="flex-1 min-h-0 p-6">
               {divisionTaskStats.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={divisionTaskStats} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                       <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={28}>
                          {divisionTaskStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-30">
                    <TrendingUp size={48} className="text-gray-300 mb-4" />
                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">No task data logged</p>
                  </div>
               )}
           </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col h-[500px] lg:h-[600px]">
          <div className="px-8 py-7 border-b border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center shrink-0 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Resource Utilization report</h3>
            <div className="flex items-center space-x-2 text-gray-400">
               <Info size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Base 40h / week threshold</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {utilizationData.length > 0 ? utilizationData.map(emp => (
              <div key={emp.id} className="flex flex-col sm:flex-row items-center p-5 sm:p-6 bg-white border border-gray-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-[#EA5B0C]/10 transition-all group gap-6">
                  <div className="flex items-center flex-1 w-full">
                     <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 mr-5 border border-gray-100 shadow-inner">
                        {emp.avatar ? <img src={emp.avatar} className="w-full h-full object-cover" alt="" /> : <span className="font-black text-gray-300 text-xl">{emp.fullName[0]}</span>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{emp.fullName}</h4>
                        <div className="h-2.5 w-full max-w-sm rounded-full bg-gray-100 overflow-hidden mt-3 mb-3 flex justify-start">
                           <div className="flex h-full rounded-full overflow-hidden" style={{ width: `${emp.utilizationPercent}%` }}>
                              {emp.distribution.map((seg) => <div key={seg.taskId} style={{ width: `${seg.relativePercent}%`, backgroundColor: seg.color }} className="h-full border-r border-white/20 last:border-0" />)}
                           </div>
                        </div>
                        {emp.topTaskName && (
                          <div className="flex items-center gap-2 overflow-hidden">
                             <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: emp.topTaskColor }}></span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">MOST ACTIVE:</span>
                             <span className="text-[11px] font-black text-gray-700 truncate">{emp.topTaskName}</span>
                             <span className="text-[11px] font-medium text-gray-400 shrink-0">({Math.round(emp.topTaskHours)}h)</span>
                          </div>
                        )}
                     </div>
                  </div>
                  <button onClick={() => onViewEmployee(emp.id)} className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-[#EA5B0C] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4500A] shadow-xl shadow-[#EA5B0C]/20 active:scale-95 transition-all">
                     <ExternalLink size={16} /> <span>Inspect</span>
                  </button>
              </div>
            )) : <div className="flex flex-col items-center py-20 opacity-30"><Search size={48} className="text-gray-300 mb-4" /><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No personnel records found</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string, description?: string }> = ({ icon, label, value, color, description }) => (
  <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 flex items-center space-x-6 group hover:shadow-[#EA5B0C]/10 transition-all relative">
    <div className={`p-4 bg-${color}-50 rounded-2xl group-hover:scale-110 transition-transform`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{label}</p>
        {description && (
          <div className="group/info relative">
            <Info size={12} className="text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wide leading-relaxed rounded-2xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl scale-95 group-hover/info:scale-100 origin-bottom">
              {description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter mt-1">{value}</p>
    </div>
  </div>
);
