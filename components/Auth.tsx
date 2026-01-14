
import React, { useState } from 'react';
import { CalendarClock, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  onLogin: (username: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gray-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gray-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-2xl shadow-black/5 overflow-hidden flex flex-col relative z-10 border border-gray-100 transform transition-all hover:scale-[1.005] duration-500">
        {/* Orange Header Section */}
        <div className="bg-[#EA5B0C] pt-12 pb-16 px-8 text-center relative">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <CalendarClock size={32} className="text-white" strokeWidth={2} />
             </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">RELX <span className="font-light opacity-90">Tracker</span></h1>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] mt-2">Enterprise Resource Management</p>
        </div>

        {/* White Body Section */}
        <div className="px-8 pb-8 -mt-6 bg-white rounded-t-[2rem] relative z-20 flex-1 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleSubmit} className="pt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enjay or noel"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#EA5B0C]/10 focus:border-[#EA5B0C] outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#EA5B0C]/10 focus:border-[#EA5B0C] outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#EA5B0C] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#D4500A] hover:shadow-xl hover:shadow-[#EA5B0C]/20 active:scale-95 transition-all mt-4"
            >
              Initialize Session
            </button>
          </form>

          {/* Demo Access Box */}
          <div className="mt-8">
             <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-4">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                   <ShieldCheck size={16} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Demo Access</p>
                   <p className="text-[10px] font-bold text-gray-600 mt-0.5">Use <span className="text-[#EA5B0C] border-b border-[#EA5B0C]/20">enjay</span> or <span className="text-[#EA5B0C] border-b border-[#EA5B0C]/20">noel</span></p>
                </div>
             </div>
             <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-widest mt-6">2026 RELX | REED ELSEVIER</p>
          </div>
        </div>
      </div>
    </div>
  );
};
