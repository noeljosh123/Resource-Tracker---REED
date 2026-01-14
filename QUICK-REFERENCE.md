# Quick Reference Guide - Resource Tracker

## File Locations Quick Reference

### Core Files
| File | Location | Purpose |
|------|----------|---------|
| Main Entry | `src/main.tsx` | Application bootstrap |
| Root Component | `src/App.tsx` | Main app logic & routing |
| HTML Template | `index.html` | Base HTML document |

### Type Definitions
| Type | Location |
|------|----------|
| All Types | `src/types/index.ts` |

### Constants & Mock Data
| Data | Location |
|------|----------|
| All Constants | `src/constants/index.ts` |

### Components by Feature

#### Authentication
| Component | File | Purpose |
|-----------|------|---------|
| AuthView | `src/components/auth/Auth.tsx` | Login screen |

#### Layout
| Component | File | Purpose |
|-----------|------|---------|
| Layout | `src/components/layout/Layout.tsx` | App shell, sidebar, navigation |

#### Employee Features
| Component | File | Purpose |
|-----------|------|---------|
| EmployeeDashboard | `src/components/employee/EmployeeDashboard.tsx` | Employee stats & overview |
| EmployeeInspection | `src/components/employee/EmployeeInspection.tsx` | Detailed employee view |

#### Manager Features
| Component | File | Purpose |
|-----------|------|---------|
| ManagerDashboard | `src/components/manager/ManagerDashboard.tsx` | Manager analytics & overview |
| ManagerApprovals | `src/components/manager/ManagerApprovals.tsx` | Approve time entries |
| TaskManagement | `src/components/manager/TaskManagement.tsx` | CRUD for tasks |
| UserManagement | `src/components/manager/UserManagement.tsx` | CRUD for users |

#### Shared Components
| Component | File | Purpose |
|-----------|------|---------|
| TrackerGrid | `src/components/shared/TrackerGrid.tsx` | Time tracking grid |

## Import Examples

### Importing Types
```typescript
import { User, UserRole, TimeEntry, Task } from './types';
import { User, UserRole, TimeEntry, Task } from '../../types'; // from nested components
```

### Importing Constants
```typescript
import { MOCK_USERS, MOCK_TASKS } from './constants';
import { MOCK_USERS, MOCK_TASKS } from '../../constants'; // from nested components
```

### Importing Components (from App.tsx)
```typescript
// Auth
import { AuthView } from './components/auth';

// Layout
import { Layout } from './components/layout';

// Employee
import { EmployeeDashboard, EmployeeInspection } from './components/employee';

// Manager
import { 
  ManagerDashboard, 
  ManagerApprovals, 
  TaskManagement, 
  UserManagement 
} from './components/manager';

// Shared
import { TrackerGrid } from './components/shared';
```

### Importing Components (from another component)
```typescript
// From employee component to shared component
import { TrackerGrid } from '../shared';

// From manager component to types
import { User, TimeEntry } from '../../types';
```

## Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Installation
```bash
npm install          # Install all dependencies
```

## Project Stats

- **Total Components**: 11 React components
- **Features**: 5 (auth, layout, employee, manager, shared)
- **Languages**: TypeScript + React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (CDN)

## Component Props Reference

### Common Props Patterns

#### User-based components
```typescript
interface Props {
  user: User;
  // ... other props
}
```

#### Data management components
```typescript
interface Props {
  entries: TimeEntry[];
  tasks: Task[];
  verticals?: Vertical[];
  onUpdate?: (data) => void;
}
```

## Adding New Code

### Add a new component:
1. Create file in appropriate feature folder
2. Add export to feature's `index.ts`
3. Import using barrel export

### Add a new type:
1. Add to `src/types/index.ts`
2. Import where needed

### Add new constants:
1. Add to `src/constants/index.ts`
2. Import where needed

---

*For detailed documentation, see STRUCTURE.md and README.md*
