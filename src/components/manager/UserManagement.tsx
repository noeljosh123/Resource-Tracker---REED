
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { UserPlus, Shield, User as UserIcon, Check, AtSign, Search, Trash2, Edit3, ArrowLeft } from 'lucide-react';

interface UserManagementProps {
  manager: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  users: User[];
}

export const UserManagement: React.FC<UserManagementProps> = ({ manager, onAddUser, onUpdateUser, onRemoveUser, users }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  
  const [success, setSuccess] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');

  const divisionUsers = useMemo(() => {
    return users.filter(u => u.divisionId === manager.divisionId);
  }, [users, manager.divisionId]);

  const filteredUsers = useMemo(() => {
    return divisionUsers.filter(u => 
      u.fullName.toLowerCase().includes(directorySearch.toLowerCase()) ||
      u.username.toLowerCase().includes(directorySearch.toLowerCase())
    );
  }, [divisionUsers, directorySearch]);

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setRole(UserRole.EMPLOYEE);
    setEditingUser(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setUsername(user.username);
    setRole(user.role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        fullName,
        username: username.toLowerCase(),
        role,
        avatar: editingUser.avatar
      });
    } else {
      onAddUser({
        fullName,
        username: username.toLowerCase(),
        role,
        divisionId: manager.divisionId
      });
    }

    resetForm();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col xl:h-[calc(100vh-180px)] space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Personnel Onboarding</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Manage and provision digital access for division employees.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 flex-1 min-h-0 overflow-visible xl:overflow-hidden">
        {/* Create / Edit User Form */}
        <div className="xl:col-span-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-2xl shadow-gray-200/50 flex flex-col xl:h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl ${editingUser ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {editingUser ? <Edit3 size={24} strokeWidth={2.5} /> : <UserPlus size={24} strokeWidth={2.5} />}
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                {editingUser ? 'Modify Account' : 'New Provision'}
              </h2>
            </div>
            {editingUser && (
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Robert Deniro"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">System Username</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="unique_handle"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Privilege</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.EMPLOYEE)}
                  className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    role === UserRole.EMPLOYEE ? 'bg-[#EA5B0C] text-white border-[#EA5B0C] shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.MANAGER)}
                  className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    role === UserRole.MANAGER ? 'bg-[#EA5B0C] text-white border-[#EA5B0C] shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  Manager
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full py-4 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 ${
                  editingUser ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#EA5B0C] hover:bg-[#D4500A]'
                }`}
              >
                {success ? <Check size={18} /> : (editingUser ? <Edit3 size={18} /> : <UserPlus size={18} />)}
                <span>{success ? 'Success' : (editingUser ? 'Commit Changes' : 'Create Access Key')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Users List */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-2xl shadow-gray-200/50 flex flex-col xl:h-full overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
             <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                  <Shield size={24} strokeWidth={2.5} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 tracking-tight">Access Directory</h2>
                   <p className="text-xs font-medium text-gray-500 mt-0.5">{divisionUsers.length} active keys issued</p>
                </div>
             </div>
             <div className="relative flex items-center flex-1 max-w-xs">
                <Search size={14} className="absolute left-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Filter directory..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-wide focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                />
             </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full min-w-[600px]">
              <thead className="sticky top-0 bg-white z-10 border-b border-gray-50">
                <tr>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 text-left">Identity</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 text-left">Handle</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 text-left">Clearance</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className={`group ${editingUser?.id === u.id ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-[#EA5B0C]/10 group-hover:text-[#EA5B0C] transition-colors">
                          {u.avatar ? (
                            <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                          ) : u.fullName[0]}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[11px] text-gray-500">{u.username}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                        u.role === UserRole.MANAGER ? 'bg-[#EA5B0C]/10 text-[#EA5B0C]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => handleEditClick(u)}
                        className={`p-2 rounded-lg transition-all ${editingUser?.id === u.id ? 'text-amber-600 bg-amber-50' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-900'}`}
                        title="Modify Profile"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onRemoveUser(u.id)}
                        className={`p-2 rounded-lg text-gray-300 transition-all ${u.id === manager.id ? 'opacity-0 pointer-events-none' : 'hover:bg-rose-50 hover:text-rose-500'}`}
                        title="Decommission Access Key"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <Search size={40} className="mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No matching records</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
