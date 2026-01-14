
import React from 'react';
import { User, TimeEntry, EntryStatus } from '../../types';
import { Check, X, Eye, ClipboardList, ShieldAlert } from 'lucide-react';

interface ManagerApprovalsProps {
  manager: User;
  users: User[];
  entries: TimeEntry[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ManagerApprovals: React.FC<ManagerApprovalsProps> = ({ users, entries, onApprove, onReject }) => {
  const pendingSubmissions = users.map(user => {
    const userPendingEntries = entries.filter(e => e.userId === user.id && e.status === EntryStatus.SUBMITTED);
    if (userPendingEntries.length === 0) return null;
    
    return {
      user,
      totalHours: userPendingEntries.reduce((a, b) => a + b.hours, 0),
      count: userPendingEntries.length
    };
  }).filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pending Verifications</h1>
            <p className="text-slate-500 font-medium mt-1">Timesheets requiring your final oversight signature.</p>
          </div>
        </div>
      </div>

      {pendingSubmissions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2rem] p-24 text-center flex flex-col items-center shadow-inner">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <p className="text-lg font-black text-slate-400">All divisions are synchronized.</p>
          <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mt-1">No pending review actions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingSubmissions.map((sub: any) => (
            <div key={sub.user.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-center justify-between group hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-orange-600/30 group-hover:scale-110 transition-transform">
                   {sub.user.fullName[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">{sub.user.fullName}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100">
                      {sub.totalHours} Hours Total
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {sub.count} Individual Task Blocks
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onReject(sub.user.id)}
                  className="flex items-center space-x-2 px-6 py-3 border border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <X size={14} />
                  <span>Reject</span>
                </button>
                <button 
                  onClick={() => onApprove(sub.user.id)}
                  className="flex items-center space-x-2 px-8 py-3.5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-600/20"
                >
                  <Check size={14} />
                  <span>Approve & Lock</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
