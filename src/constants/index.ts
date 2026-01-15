
import { UserRole, EntryStatus, User, Division, Vertical, Task, TimeEntry } from '../types';

export const MOCK_DIVISIONS: Division[] = [
  { id: 'd1', name: 'Software Engineering', managerId: 'u2' },
  { id: 'd2', name: 'Product Management', managerId: 'u4' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'enjay', fullName: 'John Smith', role: UserRole.EMPLOYEE, divisionId: 'd1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u2', username: 'noel', fullName: 'Michael Doe', role: UserRole.MANAGER, divisionId: 'd1', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u3', username: 'alice.w', fullName: 'Alice Wong', role: UserRole.EMPLOYEE, divisionId: 'd1', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u4', username: 's.parker', fullName: 'Sarah Parker', role: UserRole.MANAGER, divisionId: 'd2', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u5', username: 'r.chen', fullName: 'Robert Chen', role: UserRole.EMPLOYEE, divisionId: 'd1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u6', username: 'm.lewis', fullName: 'Marcus Lewis', role: UserRole.EMPLOYEE, divisionId: 'd1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

// Enterprise Verticals provided by user
export const ENTERPRISE_VERTICALS_LIST: string[] = [
  'Division', 'CSO', 'FAH', 'FBA', 'HRSS', 'INFOSEC', 'LEGAL', 'OPEX', 'PEO', 'PLO', 
  'RSO', 'SMO_Marketing', 'SMO_RX', 'SMO_Sales', 'SPMO', 'Support_ILO', 'Support_MNL', 
  'TO', 'TQ', 'Admin', 'Corp Services'
];

// Enterprise Tasks provided by user
export const ENTERPRISE_TASKS_LIST: string[] = [
  'CSO', 'Development', 'Testing', 'Requirements Gathering', 'Implementation',
  'Support/ Maintenance', 'Meeting', 'Experimentation', 'Documentation', 'Admin',
  'RECares', 'ERG', 'PTO', 'Holiday', 'Email', 'Attend Training', 'Conduct Training'
];

export const MOCK_VERTICALS: Vertical[] = ENTERPRISE_VERTICALS_LIST.map((name, i) => ({
  id: `v-${i}`,
  name,
  divisionId: 'd1'
}));

export const MOCK_TASKS: Task[] = [];
MOCK_VERTICALS.forEach((v) => {
  ENTERPRISE_TASKS_LIST.forEach((taskName, i) => {
    MOCK_TASKS.push({
      id: `t-${v.id}-${i}`,
      name: taskName,
      verticalId: v.id,
      divisionId: 'd1'
    });
  });
});

// Helper to generate dates for mock entries (timezone-safe)
const getRecentDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  // Use local timezone to avoid date shifts
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateMockEntries = () => {
  const entries: TimeEntry[] = [];
  
  // High Utillization User: John Smith (u1)
  for (let i = 0; i < 5; i++) {
    entries.push({
      id: `e-u1-cur-${i}`,
      userId: 'u1',
      taskId: MOCK_TASKS[i % 5].id,
      date: getRecentDate(i),
      hours: 9, // 45 hours current week
      status: EntryStatus.LOGGED
    });
  }

  // Balanced User: Alice Wong (u3)
  for (let i = 0; i < 5; i++) {
    entries.push({
      id: `e-u3-cur-${i}`,
      userId: 'u3',
      taskId: MOCK_TASKS[10 + (i % 3)].id,
      date: getRecentDate(i),
      hours: 7, // 35 hours current week
      status: EntryStatus.SUBMITTED
    });
  }

  // Robert Chen (u5) - Consistent 40h
  for (let i = 0; i < 5; i++) {
    entries.push({
      id: `e-u5-cur-${i}`,
      userId: 'u5',
      taskId: MOCK_TASKS[5].id,
      date: getRecentDate(i),
      hours: 8,
      status: EntryStatus.APPROVED
    });
  }

  // Marcus Lewis (u6) - Low utilization
  for (let i = 0; i < 3; i++) {
    entries.push({
      id: `e-u6-cur-${i}`,
      userId: 'u6',
      taskId: MOCK_TASKS[2].id,
      date: getRecentDate(i),
      hours: 6,
      status: EntryStatus.LOGGED
    });
  }

  return entries;
};

export const MOCK_TIME_ENTRIES: TimeEntry[] = generateMockEntries();
