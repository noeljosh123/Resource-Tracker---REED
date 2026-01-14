
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER'
}

// Fixed EntryStatus enum to include missing status values required by dashboard and approval components
export enum EntryStatus {
  LOGGED = 'LOGGED',
  LOCKED = 'LOCKED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  divisionId: string;
  avatar?: string;
}

export interface Division {
  id: string;
  name: string;
  managerId: string;
}

export interface Vertical {
  id: string;
  name: string;
  divisionId: string;
}

export interface Task {
  id: string;
  name: string;
  verticalId: string;
  divisionId: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  taskId: string;
  date: string; // ISO string YYYY-MM-DD
  hours: number;
  status: EntryStatus;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  divisions: Division[];
  verticals: Vertical[];
  tasks: Task[];
  timeEntries: TimeEntry[];
}
