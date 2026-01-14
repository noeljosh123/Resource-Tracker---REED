
import React, { useState } from 'react';
import { 
  User, UserRole, TimeEntry, EntryStatus, 
  Vertical, Task 
} from './types';
import { MOCK_USERS, MOCK_VERTICALS, MOCK_TASKS, MOCK_TIME_ENTRIES } from './constants';
import { AuthView } from './components/Auth';
import { Layout } from './components/Layout';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { TrackerGrid } from './components/TrackerGrid';
import { ManagerDashboard } from './components/ManagerDashboard';
import { TaskManagement } from './components/TaskManagement';
import { UserManagement } from './components/UserManagement';
import { EmployeeInspection } from './components/EmployeeInspection';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(MOCK_TIME_ENTRIES);
  const [verticals, setVerticals] = useState<Vertical[]>(MOCK_VERTICALS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [view, setView] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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

  const handleRemoveUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("System security prevents self-decommissioning of active manager handles.");
      return;
    }
    if (confirm("Decommission this personnel access key? All logged time entries will remain for auditing purposes.")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
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
          />
        );

      case 'personnel':
        return (
          <UserManagement 
            manager={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onRemoveUser={handleRemoveUser}
          />
        );

      default:
        return <div className="p-8">404 Not Found</div>;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      currentView={view} 
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
