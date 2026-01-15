
import React, { useState, useMemo, useEffect } from 'react';
import { User, TimeEntry, Task } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { Clock, ArrowRight, Zap, CalendarDays, ChevronLeft, ChevronRight, TrendingUp, Layers, PieChart } from 'lucide-react';

interface EmployeeDashboardProps {
  user: User;
  entries: TimeEntry[];
  tasks: Task[];
  onNavigateToTracker: () => void;
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

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, entries, tasks, onNavigateToTracker }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(selectedDate));
  const [view, setView] = useState<'overview' | 'tasks'>('overview');
  const [overviewRange, setOverviewRange] = useState<'day' | 'week' | 'year'>('week');
  const [allocationRange, setAllocationRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (view === 'overview') {
      setOverviewRange('week');
    }
  }, [view]);
  
  const userEntries = entries.filter(e => e.userId === user.id);

  const filteredOverviewEntries = useMemo(() => {
    if (overviewRange === 'day') {
      return userEntries.filter(e => e.date === selectedDate);
    }

    if (overviewRange === 'week') {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const startStr = start.toISOString().split('T')[0];
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endStr = end.toISOString().split('T')[0];
      return userEntries.filter(e => e.date >= startStr && e.date <= endStr);
    }

    const year = new Date(selectedDate).getUTCFullYear();
    const startStr = new Date(Date.UTC(year, 0, 1)).toISOString().split('T')[0];
    const endStr = new Date(Date.UTC(year, 11, 31)).toISOString().split('T')[0];
    return userEntries.filter(e => e.date >= startStr && e.date <= endStr);
  }, [overviewRange, userEntries, selectedDate]);

  const totalHours = filteredOverviewEntries.reduce((acc, curr) => acc + curr.hours, 0);

  const allTimeTaskStats = useMemo(() => {
    const stats: Record<string, number> = {};
    userEntries.forEach(e => {
        if (e.taskId) stats[e.taskId] = (stats[e.taskId] || 0) + e.hours;
    });
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .map(([id, hours]) => {
            const task = tasks.find(t => t.id === id);
            return { name: task?.name || 'Unknown', hours, id };
        });
  }, [userEntries, tasks]);

  const overviewTaskStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredOverviewEntries.forEach(e => {
      if (e.taskId) stats[e.taskId] = (stats[e.taskId] || 0) + e.hours;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([id, hours]) => {
        const task = tasks.find(t => t.id === id);
        return { name: task?.name || 'Unknown', hours, id };
      });
  }, [filteredOverviewEntries, tasks]);

  const filteredTaskStats = useMemo(() => {
    const currentDate = new Date(selectedDate);
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth();
    
    let startStr = '';
    let endStr = '';

    if (allocationRange === 'week') {
        const d = new Date(currentDate);
        const day = d.getUTCDay();
        d.setUTCDate(d.getUTCDate() - day);
        startStr = d.toISOString().split('T')[0];
        d.setUTCDate(d.getUTCDate() + 6);
        endStr = d.toISOString().split('T')[0];
    } else if (allocationRange === 'month') {
        const start = new Date(Date.UTC(currentYear, currentMonth, 1));
        const end = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
        startStr = start.toISOString().split('T')[0];
        endStr = end.toISOString().split('T')[0];
    } else {
        const start = new Date(Date.UTC(currentYear, 0, 1));
        const end = new Date(Date.UTC(currentYear, 11, 31));
        startStr = start.toISOString().split('T')[0];
        endStr = end.toISOString().split('T')[0];
    }

    const filtered = userEntries.filter(e => e.date >= startStr && e.date <= endStr);
    
    const stats: Record<string, number> = {};
    filtered.forEach(e => {
        if (e.taskId) stats[e.taskId] = (stats[e.taskId] || 0) + e.hours;
    });

    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .map(([id, hours]) => {
            const task = tasks.find(t => t.id === id);
            return { name: task?.name || 'Unknown', hours, id };
        });
  }, [userEntries, tasks, selectedDate, allocationRange]);

  const topTask = overviewTaskStats.length > 0 ? overviewTaskStats[0] : null;
  const uniqueTaskCount = overviewTaskStats.length;

  const weekData = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayHours = userEntries.filter(e => e.date === dateStr).reduce((acc, curr) => acc + curr.hours, 0);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: dayHours,
        date: dateStr
      };
    });
  }, [userEntries, selectedDate]);

  const yearData = useMemo(() => {
    const year = new Date(selectedDate).getUTCFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(Date.UTC(year, i, 1));
      const monthEnd = new Date(Date.UTC(year, i + 1, 0));
      const startStr = monthStart.toISOString().split('T')[0];
      const endStr = monthEnd.toISOString().split('T')[0];
      const monthHours = userEntries
        .filter(e => e.date >= startStr && e.date <= endStr)
        .reduce((acc, curr) => acc + curr.hours, 0);
      return {
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        hours: monthHours
      };
    });
  }, [userEntries, selectedDate]);

  const overviewData = useMemo(() => {
    if (overviewRange === 'day') {
      const dayHours = userEntries.filter(e => e.date === selectedDate).reduce((acc, curr) => acc + curr.hours, 0);
      return [{ name: 'Today', hours: dayHours, date: selectedDate }];
    }
    if (overviewRange === 'year') return yearData;
    return weekData;
  }, [overviewRange, userEntries, selectedDate, weekData, yearData]);

  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
      day: prevMonthLastDay - firstDayOfMonth + i + 1,
      month: month - 1,
      year: year,
      currentMonth: false
    }));
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      month: month,
      year: year,
      currentMonth: true
    }));
    const nextMonthDaysCount = 42 - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => ({
      day: i + 1,
      month: month + 1,
      year: year,
      currentMonth: false
    }));
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [calendarViewDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarViewDate(newDate);
  };

  const handleDateSelect = (day: number, month: number, year: number) => {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    if (month !== calendarViewDate.getMonth()) {
      setCalendarViewDate(new Date(year, month, 1));
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-5 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            Hey, {user.fullName.split(' ')[0]} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] mt-1 ml-1">Resource Tracker</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
           <div className="relative group flex-1 sm:flex-none">
            <div className="flex items-center justify-center space-x-2 bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-lg shadow-gray-100 cursor-pointer hover:border-[#EA5B0C]/30 transition-all">
              <CalendarDays size={18} className="text-[#EA5B0C]" strokeWidth={2.5} />
              <span className="text-[10px] sm:text-[11px] font-black text-gray-700 uppercase tracking-widest">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCalendarViewDate(new Date(e.target.value)); }} className="absolute inset-0 opacity-0 cursor-pointer w-full" />
            </div>
          </div>
          <button onClick={onNavigateToTracker} className="group inline-flex items-center justify-center px-8 py-3.5 bg-[#EA5B0C] text-white rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:bg-[#D4500A] transition-all shadow-xl shadow-[#EA5B0C]/20 active:scale-95">
            Open Timesheet <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 shrink-0">
        <StatCard icon={<Clock size={20} />} label="Total Logged" value={`${totalHours}h`} subtext="Total system allocation" color="orange" />
        <StatCard icon={<TrendingUp size={20} />} label="Top Focus" value={topTask ? topTask.name : "None"} subtext={topTask ? `${topTask.hours}h total recorded` : "No activity logged"} color="emerald" />
        <StatCard icon={<Layers size={20} />} label="Active Tasks" value={uniqueTaskCount.toString()} subtext="Unique activities logged" color="amber" className="sm:col-span-2 lg:col-span-1" />
      </div>

      <div className="flex justify-center shrink-0">
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setView('overview')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-8 py-3.5 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'overview' ? 'bg-[#EA5B0C] text-white shadow-lg shadow-[#EA5B0C]/20 scale-105' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}>
             <Clock size={16} className="mr-2" strokeWidth={2.5} />
             Temporal Analysis
           </button>
           <button onClick={() => setView('tasks')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-8 py-3.5 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'tasks' ? 'bg-[#EA5B0C] text-white shadow-lg shadow-[#EA5B0C]/20 scale-105' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}>
             <Layers size={16} className="mr-2" strokeWidth={2.5} />
             Allocated Impact
           </button>
        </div>
      </div>

      <div className="relative w-full">
        {/* Using simple conditional rendering instead of absolute positioning to allow responsive height growth on mobile */}
        {view === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-500">
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col min-h-[250px] sm:h-[380px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-[#EA5B0C]/5 rounded-xl text-[#EA5B0C]"><Zap size={22} strokeWidth={2.5} /></div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Activity Analytics</h3>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 self-start md:self-auto overflow-x-auto no-scrollbar">
                    {(['day', 'week', 'year'] as const).map((r) => (
                        <button key={r} onClick={() => setOverviewRange(r)} className={`px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${overviewRange === r ? 'bg-white text-[#EA5B0C] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                            {r}
                        </button>
                    ))}
                </div>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} />
                    <Tooltip cursor={{ fill: '#FFF8F1' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -12px rgba(234,91,12,0.1)', fontWeight: '900', padding: '12px', fontSize: '12px', color: '#111827' }} />
                    <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={40}>
                      {overviewData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.date === selectedDate ? '#EA5B0C' : '#E5E7EB'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col min-h-[250px] sm:h-[380px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><CalendarDays size={22} strokeWidth={2.5} /></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Daily Report</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => changeMonth(-1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 hover:bg-[#EA5B0C] text-gray-400 hover:text-white rounded-xl transition-all"><ChevronLeft size={14} strokeWidth={3} /></button>
                  <button onClick={() => changeMonth(1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 hover:bg-[#EA5B0C] text-gray-400 hover:text-white rounded-xl transition-all"><ChevronRight size={14} strokeWidth={3} /></button>
                </div>
              </div>
              <div className="mb-6 flex items-center justify-between shrink-0">
                <p className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <p className="text-[8px] sm:text-[9px] font-black text-[#EA5B0C] uppercase tracking-[0.1em] bg-orange-50 px-3 py-1.5 rounded-full">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</p>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 min-h-[250px] content-start overflow-y-auto no-scrollbar">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-center text-[8px] sm:text-[9px] font-black text-gray-300 py-2 uppercase tracking-widest">{day}</div>)}
                {calendarDays.map((dateObj, idx) => {
                  const dateStr = new Date(dateObj.year, dateObj.month, dateObj.day).toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const hasEntries = entries.some(e => e.userId === user.id && e.date === dateStr && e.hours > 0);
                  return (
                    <button key={idx} onClick={() => handleDateSelect(dateObj.day, dateObj.month, dateObj.year)} className={`relative flex items-center justify-center aspect-square rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black transition-all ${dateObj.currentMonth ? 'text-gray-800' : 'text-gray-200'} ${isSelected ? 'bg-[#EA5B0C] text-white shadow-lg shadow-[#EA5B0C]/20 scale-105 z-10' : 'hover:bg-gray-50'}`}>
                      {dateObj.day}
                      {hasEntries && !isSelected && <div className="absolute bottom-1 sm:bottom-2 w-1 h-1 bg-[#EA5B0C] rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-500">
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col min-h-[250px] sm:h-[380px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
                  <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><PieChart size={22} strokeWidth={2.5} /></div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Allocation Distribution</h3>
                  </div>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 self-start md:self-auto overflow-x-auto no-scrollbar">
                      {(['week', 'month', 'year'] as const).map((r) => (
                          <button key={r} onClick={() => setAllocationRange(r)} className={`px-4 sm:px-5 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${allocationRange === r ? 'bg-white text-[#EA5B0C] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                              {r}
                          </button>
                      ))}
                  </div>
              </div>
              <div className="flex-1 min-h-[200px]">
                  {filteredTaskStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredTaskStats} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#6B7280'}} />
                              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fontWeight: 700, fill: '#4B5563' }} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                              <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={24}>
                                  {filteredTaskStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center opacity-30 p-8">
                           <Layers size={40} className="text-gray-300 mb-4" />
                           <div className="text-[10px] sm:text-[12px] font-black text-gray-400 uppercase tracking-widest">No activity in this period</div>
                       </div>
                  )}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                  <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={22} strokeWidth={2.5} /></div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Impact Ranking</h3>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {filteredTaskStats.length > 0 ? filteredTaskStats.map((item, idx) => (
                      <div key={item.id} className="flex items-center p-3 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-[#EA5B0C]/20 transition-all">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black mr-3 sm:mr-4 shrink-0 text-white shadow-lg" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>{idx + 1}</div>
                          <div className="flex-1 min-w-0 mr-3">
                              <p className="text-[10px] sm:text-xs font-bold text-gray-900 truncate">{item.name}</p>
                              <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.hours / (filteredTaskStats[0]?.hours || 1)) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                              </div>
                          </div>
                          <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-black text-gray-900">{item.hours}</span>
                              <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase ml-1">h</span>
                          </div>
                      </div>
                  )) : <div className="text-center py-20 opacity-30 font-bold uppercase text-[9px] tracking-widest text-gray-400">No data</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subtext: string, color: string, className?: string }> = ({ icon, label, value, subtext, color, className = "" }) => (
  <div className={`bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-[#EA5B0C]/10 transition-all group overflow-hidden relative ${className}`}>
    <div className={`absolute -right-8 -top-8 w-28 sm:w-32 h-28 sm:h-32 bg-[#EA5B0C] opacity-[0.03] rounded-full group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="relative z-10 flex items-center space-x-3 sm:space-x-4">
      <div className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
        color === 'orange' ? 'bg-[#EA5B0C]/10 text-[#EA5B0C] group-hover:bg-[#EA5B0C] group-hover:text-white' :
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
        'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 tracking-tighter truncate leading-none">{value}</p>
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight opacity-70 truncate">{subtext}</p>
      </div>
    </div>
  </div>
);
