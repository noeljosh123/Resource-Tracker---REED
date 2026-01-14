
import React, { useState, useRef, useEffect } from 'react';
import { User, Vertical, Task } from '../../types';
import { Plus, FolderPlus, Layers, Hash, ChevronRight, ListTree, ChevronDown, Trash2 } from 'lucide-react';

interface TaskManagementProps {
  manager: User;
  verticals: Vertical[];
  tasks: Task[];
  onAddVertical: (name: string) => void;
  onAddTask: (name: string, verticalId: string) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ manager, verticals, tasks, onAddVertical, onAddTask }) => {
  const [newVerticalName, setNewVerticalName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedVerticalId, setSelectedVerticalId] = useState('');
  const [expandedVerticals, setExpandedVerticals] = useState<Set<string>>(new Set());
  
  const verticalRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const taskListRef = useRef<HTMLDivElement>(null);

  const divisionVerticals = verticals.filter(v => v.divisionId === manager.divisionId);

  // Initialize selection and expanded state
  useEffect(() => {
    if (divisionVerticals.length > 0) {
      if (!selectedVerticalId) {
        setSelectedVerticalId(divisionVerticals[0].id);
        setExpandedVerticals(new Set([divisionVerticals[0].id]));
      }
    }
  }, [divisionVerticals]);

  const toggleVertical = (id: string) => {
    const next = new Set(expandedVerticals);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedVerticals(next);
  };

  const scrollToVertical = (id: string) => {
    setSelectedVerticalId(id);
    // Auto-expand when selecting from the left
    const next = new Set(expandedVerticals);
    next.add(id);
    setExpandedVerticals(next);

    const element = verticalRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col xl:h-[calc(100vh-180px)] animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Manage hierarchical verticals and personnel tasks for your division.</p>
        </div>
        <div className="hidden lg:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
           <ListTree size={16} className="text-[#EA5B0C]" />
           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hierarchy Manager</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 flex-1 min-h-0 overflow-visible xl:overflow-hidden">
        {/* Left Side: Vertical Navigation & Creation */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-2xl shadow-gray-200/50 flex flex-col min-h-[400px] xl:min-h-0 xl:h-full overflow-hidden">
          <div className="flex items-center space-x-3 mb-6 shrink-0">
            <div className="p-3 bg-orange-50 rounded-2xl text-[#EA5B0C]">
              <FolderPlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Verticals</h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Primary Operational Segments</p>
            </div>
          </div>
          
          <div className="mb-6 shrink-0 relative flex items-center">
            <input
              type="text"
              placeholder="New vertical identifier..."
              className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold placeholder:text-gray-400 focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA5B0C] outline-none transition-all"
              value={newVerticalName}
              onChange={(e) => setNewVerticalName(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && newVerticalName.trim()) { onAddVertical(newVerticalName); setNewVerticalName(''); } }}
            />
            <button 
              onClick={() => { if(newVerticalName.trim()) { onAddVertical(newVerticalName); setNewVerticalName(''); } }}
              className="absolute right-2 bg-[#EA5B0C] text-white p-3 rounded-xl hover:bg-[#D4500A] shadow-lg shadow-[#EA5B0C]/20 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {divisionVerticals.map(v => (
              <button 
                key={v.id} 
                onClick={() => scrollToVertical(v.id)}
                className={`w-full group p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                  selectedVerticalId === v.id 
                  ? 'bg-white border-[#EA5B0C] ring-1 ring-[#EA5B0C] shadow-lg shadow-[#EA5B0C]/5' 
                  : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    selectedVerticalId === v.id ? 'bg-[#EA5B0C] text-white' : 'bg-gray-50 text-[#EA5B0C]'
                  }`}>
                    <Hash size={14} strokeWidth={2.5} />
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${
                    selectedVerticalId === v.id ? 'text-gray-900' : 'text-gray-600'
                  }`}>{v.name}</span>
                </div>
                <ChevronRight size={16} className={`transition-all ${
                  selectedVerticalId === v.id ? 'text-[#EA5B0C] translate-x-1' : 'text-gray-300'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Task Definitions & Filtered List */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-2xl shadow-gray-200/50 flex flex-col min-h-[400px] xl:min-h-0 xl:h-full overflow-hidden">
          <div className="flex items-center space-x-3 mb-6 shrink-0">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Task Definitions</h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Activity-Level Hierarchy</p>
            </div>
          </div>

          <div className="space-y-4 mb-8 shrink-0">
            <div className="relative">
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-700 focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA5B0C] outline-none transition-all appearance-none"
                value={selectedVerticalId}
                onChange={(e) => setSelectedVerticalId(e.target.value)}
              >
                <option value="">Select Vertical Map...</option>
                {divisionVerticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Task description..."
                className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold placeholder:text-gray-400 focus:ring-4 focus:ring-orange-500/10 focus:border-[#EA5B0C] outline-none transition-all"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && selectedVerticalId && newTaskName.trim()) { onAddTask(newTaskName, selectedVerticalId); setNewTaskName(''); } }}
              />
              <button 
                disabled={!selectedVerticalId || !newTaskName.trim()}
                onClick={() => { onAddTask(newTaskName, selectedVerticalId); setNewTaskName(''); }}
                className="absolute right-2 bg-gray-200 text-gray-500 p-3 rounded-xl hover:bg-gray-300 shadow-sm active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div ref={taskListRef} className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6 scroll-smooth">
            {divisionVerticals.map(v => {
              const verticalTasks = tasks.filter(t => t.verticalId === v.id);
              const isExpanded = expandedVerticals.has(v.id);
              return (
                <div 
                  key={v.id} 
                  ref={el => { verticalRefs.current[v.id] = el; }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => toggleVertical(v.id)}
                    className={`w-full flex items-center space-x-3 bg-gray-50/50 p-4 rounded-2xl border transition-all ${isExpanded ? 'border-gray-200 bg-gray-100/50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-[#EA5B0C] text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <Hash size={12} strokeWidth={3} />
                    </div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate">{v.name}</p>
                    <span className="text-[10px] font-bold text-gray-500 ml-auto uppercase tracking-wide bg-white px-3 py-1 rounded-full border border-gray-100 whitespace-nowrap">
                      {verticalTasks.length} TASKS
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 text-gray-400 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-5 pl-8 border-l-2 border-gray-100 space-y-2 relative animate-in fade-in slide-in-from-top-1 duration-200">
                      {verticalTasks.map((t) => (
                        <div key={t.id} className="relative group flex items-center">
                          {/* Tree Branch Visual */}
                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gray-100"></div>
                          
                          <div className="flex-1 p-3 px-5 rounded-2xl border bg-white border-gray-100 hover:border-[#EA5B0C]/30 hover:shadow-md transition-all flex items-center justify-between">
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[#EA5B0C] transition-colors shrink-0"></div>
                              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors tracking-tight truncate">{t.name}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 shrink-0">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {verticalTasks.length === 0 && (
                        <div className="relative p-6 bg-gray-50/30 border border-dashed border-gray-100 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gray-100"></div>
                          <p className="text-xs italic text-gray-400 font-medium">No active tasks mapped to {v.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
