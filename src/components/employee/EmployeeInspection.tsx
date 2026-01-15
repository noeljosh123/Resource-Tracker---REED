
import React, { useMemo, useState } from 'react';
import { User, TimeEntry, Task } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { ArrowLeft, Edit3, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface EmployeeInspectionProps {
  employee: User;
  entries: TimeEntry[];
  tasks: Task[];
  onBack: () => void;
  onEditTracker: () => void;
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

export const EmployeeInspection: React.FC<EmployeeInspectionProps> = ({ 
  employee, entries, tasks, onBack, onEditTracker 
}) => {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  };

  const anchorDate = useMemo(() => {
    if (entries.length === 0) return new Date();
    const latest = entries.reduce((max, entry) => (entry.date > max ? entry.date : max), entries[0].date);
    return parseDateString(latest);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let start: Date;
    let end: Date;

    if (range === 'year') {
      start = new Date(anchorDate.getFullYear(), 0, 1);
      end = new Date(anchorDate.getFullYear(), 11, 31);
    } else if (range === 'month') {
      start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
      end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    } else {
      start = new Date(anchorDate);
      start.setDate(anchorDate.getDate() - anchorDate.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    }

    const startStr = formatDate(start);
    const endStr = formatDate(end);

    return entries.filter(e => e.date >= startStr && e.date <= endStr);
  }, [entries, range, anchorDate]);

  const taskHours = filteredEntries.reduce((acc, entry) => {
    acc[entry.taskId] = (acc[entry.taskId] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(taskHours)
    .map(([taskId, hours]) => {
      const task = tasks.find(t => t.id === taskId);
      // Ensure hours is treated as a number to satisfy TypeScript arithmetic checks
      return { name: task?.name || 'Unknown', hours: Number(hours), id: taskId };
    })
    .sort((a, b) => b.hours - a.hours);

  const totalHours = filteredEntries.reduce((acc, e) => acc + e.hours, 0);
  const topTask = data.length > 0 ? data[0] : null;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-500 overflow-hidden space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{employee.fullName}</h1>
            <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Performance & Allocation Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto no-scrollbar">
            {(['week', 'month', 'year'] as const).map(option => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  range === option
                    ? 'bg-white text-[#EA5B0C] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button 
            onClick={onEditTracker}
            className="flex items-center space-x-2 px-5 py-3 bg-[#EA5B0C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4500A] transition-all shadow-lg shadow-[#EA5B0C]/20 hover:-translate-y-0.5"
          >
             <Edit3 size={14} />
             <span>View Timesheet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center space-x-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Logged</p>
               <p className="text-2xl font-black text-gray-900 tracking-tighter">{totalHours}h</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center space-x-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Most Active</p>
               <p className="text-lg font-black text-gray-900 tracking-tight truncate max-w-[150px]">{topTask ? topTask.name : '-'}</p>
               <p className="text-[9px] font-bold text-gray-400">{topTask ? `${topTask.hours}h allocated` : ''}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center space-x-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
               <AlertCircle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Diversity</p>
               <p className="text-2xl font-black text-gray-900 tracking-tighter">{data.length}</p>
               <p className="text-[9px] font-bold text-gray-400">Unique activities</p>
            </div>
         </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-8 flex flex-col">
            <div className="mb-6">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Allocation Distribution</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hours spent per task category (Total vs Task)</p>
            </div>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30, top: 20, bottom: 20 }}>
                     <XAxis type="number" hide={false} axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#9CA3AF'}}>
                        <Label value="Hours Logged" position="insideBottom" offset={-10} style={{fontSize: '9px', fontWeight: 900, fill: '#D1D5DB', textTransform: 'uppercase'}} />
                     </XAxis>
                     <YAxis 
                       type="category" 
                       dataKey="name" 
                       width={140}
                       tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }}
                       axisLine={false}
                       tickLine={false}
                     />
                     <Tooltip 
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                     />
                     <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={24}>
                        {data.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Ranking List Section */}
         <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-8 flex flex-col overflow-hidden">
            <div className="mb-6 shrink-0">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Activity Ranking</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sorted by impact</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
               {data.map((item, idx) => (
                  <div key={item.id} className="flex items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                     <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black mr-3 shrink-0 text-white shadow-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: COLORS[idx % COLORS.length], boxShadow: `0 10px 15px -3px ${COLORS[idx % COLORS.length]}40` }}
                     >
                        {idx + 1}
                     </div>
                     <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                           <div className="h-full rounded-full" style={{ width: `${(item.hours / (data[0]?.hours || 1)) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <span className="text-sm font-black text-gray-900">{item.hours}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase ml-0.5">h</span>
                     </div>
                  </div>
               ))}
               {data.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                     <p className="text-xs font-bold text-gray-400">No data available</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
