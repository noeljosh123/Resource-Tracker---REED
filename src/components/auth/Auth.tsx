
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Compact Header */}
        <div className="bg-[#EA5B0C] px-6 py-6 text-center">
          <div className="flex justify-center mb-3">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm p-2">
                <img src="/relx.png" alt="RELX Logo" className="w-full h-full object-contain" />
             </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg font-bold tracking-tight text-white">RELX</span>
            <div className="w-px h-5 bg-white/50"></div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold tracking-wide text-white">REED</span>
              <span className="text-[10px] font-bold tracking-wide text-white">ELSEVIER</span>
            </div>
          </div>
          <p className="text-[8px] font-bold text-white/80 uppercase tracking-wider">Enterprise Resource Management</p>
        </div>

        {/* Compact Form */}
        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Identity</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enjay or noel"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-[#EA5B0C]/20 focus:border-[#EA5B0C] outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-[#EA5B0C]/20 focus:border-[#EA5B0C] outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#EA5B0C] text-white font-black uppercase tracking-wider text-[10px] rounded-xl hover:bg-[#D4500A] active:scale-95 transition-all mt-2"
            >
              Initialize Session
            </button>
          </form>

          {/* Compact Demo Access */}
          <div className="mt-5">
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                   <ShieldCheck size={12} className="text-gray-400" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Demo Access</p>
                   <p className="text-[9px] font-bold text-gray-600">Use <span className="text-[#EA5B0C]">enjay</span> or <span className="text-[#EA5B0C]">noel</span></p>
                </div>
             </div>
             <div className="flex items-center justify-center gap-1.5 mt-4">
               <img src="/relx.png" alt="RELX Logo" className="w-5 h-5 object-contain" />
               <span className="text-[9px] font-bold text-[#5B6670]">RELX</span>
               <div className="w-px h-3 bg-gray-300"></div>
               <div className="flex flex-col leading-tight">
                 <span className="text-[7px] font-bold text-[#5B6670]">REED</span>
                 <span className="text-[7px] font-bold text-[#5B6670]">ELSEVIER</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
