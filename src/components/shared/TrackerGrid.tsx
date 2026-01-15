
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Vertical, Task, TimeEntry, EntryStatus } from '../../types';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2, Search, Check, Send, ArrowLeft } from 'lucide-react';

interface TrackerGridProps {
  viewer: User;
  employee: User;
  verticals: Vertical[];
  tasks: Task[];
  entries: TimeEntry[];
  onUpdateEntry: (userId: string, taskId: string, date: string, hours: number) => void;
  onDeleteWeekEntries?: (userId: string, taskId: string, dateRange: string[]) => void;
  onSubmit?: () => void;
  onBackToSelf?: () => void;
}

interface GridRow {
  id: string;
  verticalId: string;
  taskId: string;
}

const SearchableSelector: React.FC<{
  items: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}> = ({ items, selectedId, onSelect, disabled, placeholder = 'Select...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedItem = items.find(i => i.id === selectedId);
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom, left: rect.left, width: rect.width });
      }
    };
    if (isOpen) {
       handleResize();
       window.addEventListener('scroll', handleResize, true);
       window.addEventListener('resize', handleResize);
    }
    return () => {
       window.removeEventListener('scroll', handleResize, true);
       window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.searchable-selector-dropdown')) { setIsOpen(false); }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (disabled) {
    return <div className={`px-3 py-2 text-[10px] sm:text-[11px] font-bold text-gray-900 tracking-tight truncate ${className}`}>{selectedItem?.name || placeholder}</div>;
  }

  return (
    <div className={`relative w-full h-full flex items-center ${className}`} ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left px-3 py-2 text-[10px] sm:text-[11px] font-bold text-gray-900 tracking-tight truncate flex items-center justify-between group h-full">
        <span className={`truncate ${!selectedItem ? 'text-gray-300 italic font-medium' : 'text-gray-900'}`}>{selectedItem?.name || placeholder}</span>
        <ChevronRight size={14} className={`shrink-0 ml-1 text-gray-300 group-hover:text-[#EA5B0C] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div className="searchable-selector-dropdown fixed bg-white border border-gray-100 rounded-2xl shadow-2xl z-[99999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ top: coords.top + 4, left: coords.left, width: Math.max(coords.width, 220) }}>
          <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input autoFocus type="text" placeholder="Filter..." className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none focus:ring-0" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <button key={item.id} onClick={() => { onSelect(item.id); setIsOpen(false); setSearch(''); }} className={`w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between ${item.id === selectedId ? 'bg-[#EA5B0C]/10 text-[#EA5B0C]' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="truncate">{item.name}</span>
                {item.id === selectedId && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            )) : <div className="p-6 text-[10px] font-bold text-gray-300 uppercase text-center italic">No matches</div>}
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export const TrackerGrid: React.FC<TrackerGridProps> = ({ 
  viewer, employee, verticals, tasks, entries, onUpdateEntry, onDeleteWeekEntries, onSubmit, onBackToSelf
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [localRows, setLocalRows] = useState<GridRow[]>([]);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [deleteRowTaskId, setDeleteRowTaskId] = useState<string>('');
  const [deleteRowTaskName, setDeleteRowTaskName] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isInspecting = viewer.id !== employee.id && !!onBackToSelf;

  useEffect(() => {
    if (localRows.length === 0) {
      const taskIdsInEntries = Array.from(new Set(entries.map(e => e.taskId)));
      const existingRows = taskIdsInEntries.map(tid => {
        const task = tasks.find(t => t.id === tid);
        return { id: Math.random().toString(36).substring(2, 11), verticalId: task?.verticalId || (verticals.length > 0 ? verticals[0].id : ''), taskId: tid };
      }).filter(r => r.taskId);
      if (existingRows.length === 0 && viewer.id === employee.id) {
        existingRows.push({ id: 'default-row-' + employee.id, verticalId: verticals.length > 0 ? verticals[0].id : '', taskId: '' });
      }
      setLocalRows(existingRows);
    }
  }, [employee.id]); 

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return { dateStr: d.toISOString().split('T')[0], dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear() };
    });
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    const start = days[0];
    const end = days[6];
    return `${start.month} ${start.dayNum} - ${end.month} ${end.dayNum}, ${end.year}`;
  }, [days]);

  const handleDateJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const selectedDate = new Date(val);
    selectedDate.setHours(0, 0, 0, 0);
    const todaySun = new Date();
    todaySun.setHours(0,0,0,0);
    todaySun.setDate(todaySun.getDate() - todaySun.getDay());
    const selectedSun = new Date(selectedDate);
    selectedSun.setDate(selectedDate.getDate() - selectedDate.getDay());
    setWeekOffset(Math.round((selectedSun.getTime() - todaySun.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      try {
        if ('showPicker' in dateInputRef.current) {
          (dateInputRef.current as any).showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (e) {
        dateInputRef.current.click();
      }
    }
  };

  const getHours = (taskId: string, date: string) => taskId ? (entries.find(e => e.taskId === taskId && e.date === date)?.hours || 0) : 0;
  const isReadOnly = (date: string, taskId: string) => {
    if (!taskId || viewer.id !== employee.id) return true;
    const entry = entries.find(e => e.taskId === taskId && e.date === date);
    return entry?.status === EntryStatus.LOCKED || entry?.status === EntryStatus.APPROVED;
  };

  const dailyTotals = days.map(day => localRows.reduce((acc, row) => acc + getHours(row.taskId, day.dateStr), 0));

  const addRow = () => {
    setLocalRows(prev => [...prev, { id: Math.random().toString(36).substring(2, 11), verticalId: verticals[0]?.id || '', taskId: '' }]);
  };

  const requestRemoveRow = (rowId: string) => {
    const row = localRows.find(r => r.id === rowId);
    if (!row || !row.taskId) {
      // If no task selected, just remove the row
      setLocalRows(prev => prev.filter(r => r.id !== rowId));
      return;
    }
    const task = tasks.find(t => t.id === row.taskId);
    setDeleteRowId(rowId);
    setDeleteRowTaskId(row.taskId);
    setDeleteRowTaskName(task?.name || 'this task');
  };

  const confirmRemoveRow = () => {
    if (deleteRowId && deleteRowTaskId && onDeleteWeekEntries) {
      // Get the exact dates for the CURRENT week being viewed (based on weekOffset)
      const weekDates = days.map(day => day.dateStr);
      console.log('TrackerGrid - Requesting delete for week:', { weekOffset, weekDates, employeeId: employee.id, taskId: deleteRowTaskId });
      // Ensure we only delete entries for these specific dates (current week only)
      onDeleteWeekEntries(employee.id, deleteRowTaskId, weekDates);
    }
    // Remove the row from UI
    setLocalRows(prev => prev.filter(r => r.id !== deleteRowId));
    setDeleteRowId(null);
    setDeleteRowTaskId('');
    setDeleteRowTaskName('');
  };

  const updateRowSelection = (rowId: string, field: 'verticalId' | 'taskId', value: string) => {
    if (field === 'verticalId') {
      // Keep taskId to avoid clearing entered hours; user can reselect a task after changing vertical.
      setLocalRows(prev => prev.map(r => r.id === rowId ? { ...r, verticalId: value } : r));
      return;
    }

    if (localRows.some(r => r.id !== rowId && r.taskId === value)) { alert("Task already exists in another row."); return; }

    const row = localRows.find(r => r.id === rowId);
    const previousTaskId = row?.taskId;

    if (previousTaskId && previousTaskId !== value) {
      // Move existing hours from the old task to the newly selected task.
      days.forEach(day => {
        const hours = getHours(previousTaskId, day.dateStr);
        if (hours > 0) {
          onUpdateEntry(employee.id, value, day.dateStr, hours);
          onUpdateEntry(employee.id, previousTaskId, day.dateStr, 0);
        }
      });
    }

    setLocalRows(prev => prev.map(r => r.id === rowId ? { ...r, taskId: value } : r));
  };

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-[#EA5B0C]/5 flex flex-col min-h-[500px] md:h-full overflow-hidden animate-in slide-in-from-bottom duration-700">
      <div className="px-5 sm:px-8 py-5 sm:py-6 bg-[#FCFCFC] border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {isInspecting && (
            <button 
              onClick={onBackToSelf} 
              className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[#EA5B0C] shadow-sm transition-all active:scale-95"
              title="Return to my tracker"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center bg-gray-50 rounded-[1.2rem] sm:rounded-[1.5rem] p-1 border border-gray-100 shadow-inner">
            <button onClick={() => setWeekOffset(v => v - 1)} className="p-2.5 sm:p-3 text-gray-400 hover:text-[#EA5B0C] hover:bg-white rounded-xl transition-all"><ChevronLeft size={16} /></button>
            <div className="relative mx-1">
               <div 
                 onClick={handleCalendarClick}
                 className="relative flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#EA5B0C]/30 transition-all cursor-pointer group active:scale-[0.98]"
               >
                  <CalendarDays size={16} strokeWidth={2.5} className="text-[#EA5B0C] mr-2 sm:mr-3 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-tight whitespace-nowrap">{weekRangeLabel}</span>
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full" 
                    onChange={handleDateJump} 
                  />
               </div>
            </div>
            <button onClick={() => setWeekOffset(v => v + 1)} className="p-2.5 sm:p-3 text-gray-400 hover:text-[#EA5B0C] hover:bg-white rounded-xl transition-all"><ChevronRight size={16} /></button>
          </div>
          <div className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-[#EA5B0C]/5 border border-[#EA5B0C]/10 rounded-xl sm:rounded-2xl">
             <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#EA5B0C]/60 mr-2 sm:mr-3">ID:</span>
             <span className="text-[10px] sm:text-[11px] font-black text-gray-900 truncate max-w-[150px]">{employee.fullName}</span>
          </div>
        </div>
        <div className="hidden xl:block text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">RELX ENTERPRISE RESOURCE LOGGING</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#FCFCFC] border-b border-gray-50">
                <th className="sticky left-0 z-[40] bg-white px-5 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-[140px] border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Vertical</th>
                <th className="sticky left-[140px] z-[40] bg-white px-5 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-[200px] border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Task</th>
                {days.map(day => (
                  <th key={day.dateStr} className="py-3 text-center border-r border-gray-50 w-20 sm:w-24 bg-[#FCFCFC] z-0">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{day.dayName}</p>
                    <p className="text-[12px] font-black text-gray-900 tracking-tighter">{day.dayNum} {day.month}</p>
                  </th>
                ))}
                <th className="py-3 text-center bg-gray-50 font-black text-gray-400 text-[9px] uppercase tracking-widest w-20 sm:w-24 border-l border-gray-50">Net</th>
                {viewer.id === employee.id && <th className="w-12 bg-gray-50 border-l border-gray-50"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localRows.map((row) => {
                let rowTotal = 0;
                const filteredTasks = tasks.filter(t => t.verticalId === row.verticalId);
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors h-12 sm:h-14 group">
                    <td className="sticky left-0 z-[30] bg-white group-hover:bg-gray-100 px-0 border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <SearchableSelector items={verticals} selectedId={row.verticalId} onSelect={(vid) => updateRowSelection(row.id, 'verticalId', vid)} disabled={viewer.id !== employee.id} />
                    </td>
                    <td className="sticky left-[140px] z-[30] bg-white group-hover:bg-gray-100 px-0 border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <SearchableSelector items={filteredTasks} selectedId={row.taskId} onSelect={(tid) => updateRowSelection(row.id, 'taskId', tid)} disabled={viewer.id !== employee.id} />
                    </td>
                    {days.map(day => {
                      const val = getHours(row.taskId, day.dateStr);
                      rowTotal += val;
                      const disabled = isReadOnly(day.dateStr, row.taskId);
                      return (
                        <td key={day.dateStr} className="p-0 border-r border-gray-50 h-full">
                          <input type="number" min="0" max="24" step="0.5" value={val || ''} disabled={disabled} onChange={(e) => onUpdateEntry(employee.id, row.taskId, day.dateStr, parseFloat(e.target.value) || 0)} className={`w-full h-full text-center text-xs sm:text-sm font-black focus:outline-none transition-all ${disabled ? 'bg-gray-50/30 text-gray-200 cursor-not-allowed' : 'bg-transparent focus:bg-white focus:shadow-inner text-gray-800'}`} placeholder={row.taskId ? "0" : "-"} />
                        </td>
                      );
                    })}
                    <td className="py-2 text-center font-black text-[#EA5B0C] bg-[#EA5B0C]/5 text-[11px] sm:text-xs tracking-tighter border-l border-gray-50">{rowTotal || '-'}</td>
                    {viewer.id === employee.id && (
                      <td className="py-2 text-center border-l border-gray-50">
                        <button onClick={() => requestRemoveRow(row.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2"><Trash2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Add Tracking Line Button */}
          {viewer.id === employee.id && (
            <div className="p-4 sm:p-6 bg-[#FCFCFC]/80 border-t border-gray-50 sticky left-0 right-0 z-[20] w-full min-w-[900px]">
              <button onClick={addRow} className="flex items-center space-x-2 sm:space-x-3 px-6 py-4 sm:py-5 text-[#EA5B0C] hover:bg-[#EA5B0C] hover:text-white rounded-xl sm:rounded-[1.5rem] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all w-full justify-center border-2 border-dashed border-[#EA5B0C]/20 shadow-sm active:scale-[0.99]">
                <Plus size={16} strokeWidth={4} /><span>ADD TRACKING LINE</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Responsive Footer Summary Bar */}
        <div className="bg-white border-t border-gray-100 shrink-0 z-40 overflow-x-auto no-scrollbar">
          <div className="flex w-full items-center h-20 sm:h-24 min-w-[900px]">
            <div className="w-[340px] shrink-0 p-5 sm:p-8 flex flex-col justify-center items-start pl-8 sm:pl-10 border-r border-gray-100 bg-[#FAFAFA] sticky left-0 z-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                 <span className="text-[9px] sm:text-[11px] font-black text-gray-700 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Allocations</span>
                 <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 sm:mt-1">Weekly Cumulative</span>
            </div>
            {dailyTotals.map((total, idx) => (
              <div key={idx} className="w-20 sm:w-24 shrink-0 h-full flex flex-col items-center justify-center border-r border-gray-50 bg-white transition-colors hover:bg-gray-50">
                <span className={`text-base sm:text-xl font-black tracking-tighter leading-none ${total === 0 ? 'text-gray-200' : 'text-gray-900'}`}>{total}</span>
                {total > 0 && <span className="text-[8px] sm:text-[9px] font-black text-[#EA5B0C] uppercase mt-1 sm:mt-1.5 opacity-50">Hrs</span>}
              </div>
            ))}
            <div className="w-20 sm:w-24 shrink-0 h-full flex flex-col items-center justify-center bg-[#EA5B0C] text-white shadow-2xl z-10">
               <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none italic">{dailyTotals.reduce((a, b) => a + b, 0)}</span>
               <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-1.5 sm:mt-2 opacity-80">NET</span>
            </div>
            {viewer.id === employee.id && <div className="w-12 shrink-0 bg-white"></div>}
          </div>
        </div>
      </div>

      {/* Delete Tracking Line Confirmation Modal */}
      {deleteRowId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => { setDeleteRowId(null); setDeleteRowTaskId(''); setDeleteRowTaskName(''); }}>
          <div className="bg-white rounded-2xl w-full max-w-[380px] shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Trash2 size={16} className="text-[#EA5B0C]" strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-black text-gray-900 tracking-tight">Delete Tracking Line</h3>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">
                Delete this tracking line? All logged hours for <span className="font-black text-gray-900">{deleteRowTaskName}</span> in the current week ({weekRangeLabel}) will be removed. Previous weeks' data will remain intact.
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setDeleteRowId(null); setDeleteRowTaskId(''); setDeleteRowTaskName(''); }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemoveRow}
                  className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#EA5B0C] text-white hover:bg-[#D4500A] transition-all active:scale-95 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
