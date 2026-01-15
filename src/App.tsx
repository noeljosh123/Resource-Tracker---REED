
import React, { useState } from 'react';
import { 
  User, UserRole, TimeEntry, EntryStatus, 
  Vertical, Task 
} from './types';
import { MOCK_USERS, MOCK_VERTICALS, MOCK_TASKS, MOCK_TIME_ENTRIES } from './constants';
import { AuthView } from './components/auth';
import { Layout } from './components/layout';
import { EmployeeDashboard, EmployeeInspection } from './components/employee';
import { TrackerGrid } from './components/shared';
import { ManagerDashboard, TaskManagement, UserManagement } from './components/manager';
import { Shield, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(MOCK_TIME_ENTRIES);
  const [verticals, setVerticals] = useState<Vertical[]>(MOCK_VERTICALS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [view, setView] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>('');

  const handleLogin = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
    } else {
      alert('Invalid credentials (try "enjay" or "noel")');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
    setSelectedEmployeeId(null);
  };

  const handleNavigate = (newView: string) => {
    // Clear selection when navigating to main pages via sidebar to prevent "stuck" inspection context
    setSelectedEmployeeId(null);
    setView(newView);
  };

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 11)
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setTimeEntries(prev => prev.filter(e => e.taskId !== taskId));
  };

  const handleRemoveVertical = (verticalId: string) => {
    setVerticals(prev => prev.filter(v => v.id !== verticalId));
    // Also remove all tasks associated with this vertical
    setTasks(prev => prev.filter(t => t.verticalId !== verticalId));
    // Also remove all time entries associated with tasks in this vertical
    const taskIdsToRemove = tasks.filter(t => t.verticalId === verticalId).map(t => t.id);
    setTimeEntries(prev => prev.filter(e => !taskIdsToRemove.includes(e.taskId)));
  };

  const requestRemoveUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      alert("System security prevents self-decommissioning of active manager handles.");
      return;
    }
    setDeleteUserId(userId);
    setDeleteUserName(userName);
  };

  const confirmRemoveUser = () => {
    if (deleteUserId) {
      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
      setDeleteUserName('');
    }
  };

  const updateTimeEntry = (userId: string, taskId: string, date: string, hours: number) => {
    setTimeEntries(prev => {
      const existingIdx = prev.findIndex(e => e.userId === userId && e.taskId === taskId && e.date === date);
      if (existingIdx > -1) {
        if (prev[existingIdx].status === EntryStatus.LOCKED || prev[existingIdx].status === EntryStatus.APPROVED) return prev;
        const newEntries = [...prev];
        newEntries[existingIdx] = { ...newEntries[existingIdx], hours };
        return newEntries;
      }
      const newEntry: TimeEntry = {
        id: Math.random().toString(36).substring(2, 11),
        userId,
        taskId,
        date,
        hours,
        status: EntryStatus.LOGGED
      };
      return [...prev, newEntry];
    });
  };

  const deleteWeekEntries = (userId: string, taskId: string, dateRange: string[]) => {
    // Direct string comparison - dates are already in YYYY-MM-DD format
    const dateSet = new Set(dateRange);
    
    console.log('DELETE REQUEST:', { userId, taskId, dateRange });
    
    setTimeEntries(prev => {
      const filtered = prev.filter(e => {
        // Only delete if ALL conditions match EXACTLY:
        // 1. User matches
        // 2. Task matches  
        // 3. Date string is EXACTLY in the provided date range (current week only)
        const shouldDelete = e.userId === userId && 
                            e.taskId === taskId && 
                            dateSet.has(e.date);
        
        if (shouldDelete) {
          console.log('DELETING:', e);
        }
        
        return !shouldDelete; // Keep entries that should NOT be deleted
      });
      
      console.log('Entries before delete:', prev.length, 'After delete:', filtered.length);
      return filtered;
    });
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    if (confirm("Submit and verify all pending logs?")) {
        // Auto-approve as per new automated workflow requirement
        setTimeEntries(prev => prev.map(e => 
            e.userId === currentUser.id && e.status === EntryStatus.LOGGED 
                ? { ...e, status: EntryStatus.APPROVED }
                : e
        ));
    }
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return currentUser.role === UserRole.MANAGER 
          ? <ManagerDashboard 
              user={currentUser} 
              entries={timeEntries} 
              users={users} 
              tasks={tasks}
              onViewEmployee={(id) => { setSelectedEmployeeId(id); setView('inspection'); }}
            />
          : <EmployeeDashboard 
              user={currentUser} 
              entries={timeEntries} 
              tasks={tasks}
              onNavigateToTracker={() => setView('tracker')} 
            />;
      
      case 'my-overview':
        // Re-use EmployeeDashboard for Manager's Personal View
        return <EmployeeDashboard 
            user={currentUser} 
            entries={timeEntries} 
            tasks={tasks}
            onNavigateToTracker={() => {
                setSelectedEmployeeId(null);
                setView('tracker');
            }} 
          />;

      case 'inspection':
        const inspectionTarget = users.find(u => u.id === selectedEmployeeId);
        if (!inspectionTarget || currentUser.role !== UserRole.MANAGER) return <div>Error</div>;
        
        return (
          <EmployeeInspection 
            employee={inspectionTarget}
            entries={timeEntries.filter(e => e.userId === inspectionTarget.id)}
            tasks={tasks}
            onBack={() => { setSelectedEmployeeId(null); setView('dashboard'); }}
            onEditTracker={() => setView('tracker')}
          />
        );

      case 'tracker':
        const targetId = currentUser.role === UserRole.MANAGER ? (selectedEmployeeId || currentUser.id) : currentUser.id;
        const targetUser = users.find(u => u.id === targetId) || currentUser;
        
        return (
          <TrackerGrid 
            viewer={currentUser}
            employee={targetUser}
            verticals={verticals}
            tasks={tasks}
            entries={timeEntries.filter(e => e.userId === targetId)}
            onUpdateEntry={updateTimeEntry}
            onDeleteWeekEntries={deleteWeekEntries}
            onSubmit={handleSubmit}
            onBackToSelf={() => {
                setSelectedEmployeeId(null);
            }}
          />
        );

      case 'tasks':
        return (
          <TaskManagement 
            manager={currentUser}
            verticals={verticals}
            tasks={tasks}
            onAddVertical={(name) => setVerticals([...verticals, { id: Date.now().toString(), name, divisionId: currentUser.divisionId }])}
            onAddTask={(name, vId) => setTasks([...tasks, { id: Date.now().toString(), name, verticalId: vId, divisionId: currentUser.divisionId }])}
            onRemoveTask={handleRemoveTask}
            onRemoveVertical={handleRemoveVertical}
          />
        );

      case 'personnel':
        return (
          <UserManagement 
            manager={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onRemoveUser={requestRemoveUser}
          />
        );

      default:
        return <div className="p-8">404 Not Found</div>;
    }
  };

  return (
    <>
      <Layout 
        user={currentUser} 
        currentView={view} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      >
        {renderContent()}
      </Layout>

      {/* Delete User Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => { setDeleteUserId(null); setDeleteUserName(''); }}>
          <div className="bg-white rounded-2xl w-full max-w-[380px] shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Shield size={16} className="text-[#EA5B0C]" strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-black text-gray-900 tracking-tight">Decommission Access Key</h3>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">
                Decommission this personnel access key? <span className="font-black text-gray-900">{deleteUserName}</span> will lose system access. All logged time entries will remain for auditing purposes.
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setDeleteUserId(null); setDeleteUserName(''); }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemoveUser}
                  className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#EA5B0C] text-white hover:bg-[#D4500A] transition-all active:scale-95 shadow-sm"
                >
                  Decommission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
