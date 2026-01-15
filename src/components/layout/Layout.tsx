
import React from 'react';
import { User, UserRole } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  UserPlus,
  Upload,
  Layers,
  PieChart,
  X
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentView, onNavigate, onLogout, onUpdateUser, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = React.useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const sidebarTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSidebarMouseEnter = () => {
    sidebarTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(true);
    }, 500); // 0.5 second delay
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current);
      sidebarTimeoutRef.current = null;
    }
    setIsSidebarExpanded(false);
  };

  React.useEffect(() => {
    return () => {
      if (sidebarTimeoutRef.current) {
        clearTimeout(sidebarTimeoutRef.current);
      }
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.EMPLOYEE, UserRole.MANAGER] },
    { id: 'my-overview', label: 'My Overview', icon: PieChart, roles: [UserRole.MANAGER] },
    { id: 'tracker', label: 'Tracker', icon: Calendar, roles: [UserRole.EMPLOYEE, UserRole.MANAGER] },
    { id: 'tasks', label: 'Management', icon: Layers, roles: [UserRole.MANAGER] },
    { id: 'personnel', label: 'Personnel', icon: UserPlus, roles: [UserRole.MANAGER] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if(onUpdateUser && newAvatarUrl && newAvatarUrl !== user.avatar) {
        onUpdateUser({ ...user, avatar: newAvatarUrl });
    }
    setShowProfileModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileModal = () => {
    setNewAvatarUrl(user.avatar || '');
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] font-sans">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col ${isSidebarExpanded ? 'w-64' : 'w-[88px]'} bg-white text-gray-900 shrink-0 h-screen transition-all duration-300 ease-in-out border-r border-gray-100 shadow-sm group z-50`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="p-6 pb-2 overflow-hidden flex flex-col h-full">
          <div className="mb-6 mt-2 px-2 flex items-center gap-3 whitespace-nowrap min-h-[40px]">
             <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img src="/relx.png" alt="RELX Logo" className="w-full h-full object-contain" />
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-3">
                <span className="text-2xl font-bold tracking-tight text-[#5B6670]">RELX</span>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold tracking-wide text-[#5B6670]">REED</span>
                  <span className="text-sm font-bold tracking-wide text-[#5B6670]">ELSEVIER</span>
                </div>
             </div>
          </div>
          
          <div className="h-px bg-gray-100 mb-6 mx-2 shrink-0"></div>
          
          <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all relative ${
                  currentView === item.id 
                    ? `${isSidebarExpanded ? 'bg-[#0F172A] text-white shadow-xl shadow-gray-200' : ''} before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-[#EA5B0C] before:rounded-r-full ${isSidebarExpanded ? 'before:bg-white' : ''}` 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 flex justify-center shrink-0">
                  <item.icon size={20} strokeWidth={2.5} className={`transition-colors ${currentView === item.id ? (isSidebarExpanded ? 'text-white' : 'text-[#EA5B0C]') : 'text-[#EA5B0C]'}`} />
                </div>
                <span className="tracking-wide whitespace-nowrap opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                    {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-2 shrink-0">
             <div className="h-px bg-gray-100 mb-4 mx-2"></div>
             <button onClick={openProfileModal} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all group/btn">
              <div className="w-5 flex justify-center shrink-0">
                 <Settings size={20} strokeWidth={2.5} className="text-[#EA5B0C] group-hover/btn:text-gray-900 transition-colors" />
              </div>
              <span className="tracking-wide whitespace-nowrap opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">Settings</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group/btn">
              <div className="w-5 flex justify-center shrink-0">
                <LogOut size={20} strokeWidth={2.5} className="text-[#EA5B0C] group-hover/btn:text-red-600 transition-colors" />
              </div>
              <span className="tracking-wide whitespace-nowrap opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="p-6 h-full flex flex-col">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 flex items-center justify-center">
                   <img src="/relx.png" alt="RELX Logo" className="w-full h-full object-contain" />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xl font-bold tracking-tight text-[#5B6670]">RELX</span>
                   <div className="w-px h-6 bg-gray-300"></div>
                   <div className="flex flex-col leading-tight">
                     <span className="text-xs font-bold tracking-wide text-[#5B6670]">REED</span>
                     <span className="text-xs font-bold tracking-wide text-[#5B6670]">ELSEVIER</span>
                   </div>
                 </div>
               </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl text-gray-500">
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-4 flex-1">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    currentView === item.id 
                      ? 'bg-[#0F172A] text-white shadow-xl' 
                      : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} className={currentView === item.id ? 'text-white' : 'text-[#EA5B0C]'} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto space-y-4">
              <button onClick={() => { openProfileModal(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-gray-500 bg-gray-50">
                <Settings size={20} className="text-[#EA5B0C]" />
                Settings
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-600 bg-red-50">
                <LogOut size={20} className="text-red-600" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/relx.png" alt="RELX Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-base tracking-tight text-gray-900">
            <span className="font-bold">RELX</span>
            <span className="font-normal ml-1">Tracker</span>
          </h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden relative">
        {/* Top Header - Desktop only */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-[#FAFAFA] shrink-0 border-b border-gray-50">
          <div className="flex items-center space-x-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Application</h2>
            <span className="text-gray-300 font-bold text-[10px] mx-1">:</span>
            <h2 className="text-[10px] font-bold text-[#EA5B0C] uppercase tracking-[0.25em]">
              {navItems.find(i => i.id === currentView)?.label || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
             <div className="text-right">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Logged in as</p>
                <p className="text-sm font-black text-gray-900 tracking-tight">{user.fullName}</p>
             </div>
             <button onClick={openProfileModal} className="relative group">
               {user.avatar ? (
                 <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" alt="Profile" />
               ) : (
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#EA5B0C] border-2 border-white shadow-sm">
                    {user.fullName[0]}
                 </div>
               )}
               <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
             </button>
          </div>
        </header>
        
        {/* Responsive Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 lg:p-6">
          <div className="max-w-[1140px] xl:max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-[#EA5B0C] p-8 pb-16 shrink-0 relative">
                     <h3 className="text-xl font-black text-white tracking-tight text-center">User Profile</h3>
                     <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem]"></div>
                </div>
                
                <div className="px-8 pb-8 -mt-12 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex flex-col items-center">
                        <div onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-xl bg-gray-100 cursor-pointer hover:scale-105 transition-transform relative group overflow-hidden mb-4 shrink-0">
                            {newAvatarUrl ? (
                                <img src={newAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300">{user.fullName[0]}</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <Upload className="text-white drop-shadow-lg" size={32} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-[#EA5B0C] uppercase tracking-widest mb-8 bg-[#EA5B0C]/10 px-3 py-1 rounded-full">Tap image to update</p>
                        
                        <div className="w-full space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900 border border-gray-100">{user.fullName}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">System ID</label>
                                    <div className="p-4 bg-gray-50 rounded-2xl text-xs font-black text-gray-600 border border-gray-100 font-mono tracking-tight">{user.id}</div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                    <div className="p-4 bg-gray-50 rounded-2xl text-xs font-black text-gray-900 border border-gray-100 uppercase tracking-wider">{user.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-white border-t border-gray-50 shrink-0">
                  <form onSubmit={handleSaveProfile} className="flex justify-end space-x-3">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => setShowProfileModal(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">Close</button>
                    <button type="submit" disabled={!newAvatarUrl || newAvatarUrl === user.avatar} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${(!newAvatarUrl || newAvatarUrl === user.avatar) ? 'bg-gray-100 text-gray-300' : 'bg-[#EA5B0C] text-white hover:bg-[#D4500A]'}`}>Save</button>
                  </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
