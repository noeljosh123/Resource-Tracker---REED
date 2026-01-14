# Project Structure Documentation

## Overview

This project follows a professional, scalable architecture with feature-based organization for maximum maintainability and developer experience.

## Directory Structure

```
Resource-Tracker---REED/
├── public/                      # Public static assets
│   └── relx.png                # Company logo
│
├── src/                         # Source code directory
│   ├── components/              # React components (feature-based)
│   │   │
│   │   ├── auth/               # Authentication Feature
│   │   │   ├── Auth.tsx        # Login component
│   │   │   └── index.ts        # Barrel export
│   │   │
│   │   ├── employee/           # Employee Feature
│   │   │   ├── EmployeeDashboard.tsx    # Employee overview & stats
│   │   │   ├── EmployeeInspection.tsx   # Detailed employee inspection
│   │   │   └── index.ts                 # Barrel export
│   │   │
│   │   ├── layout/             # Layout & Shell
│   │   │   ├── Layout.tsx      # Main app layout with sidebar
│   │   │   └── index.ts        # Barrel export
│   │   │
│   │   ├── manager/            # Manager Feature
│   │   │   ├── ManagerApprovals.tsx    # Time entry approvals
│   │   │   ├── ManagerDashboard.tsx    # Manager overview & analytics
│   │   │   ├── TaskManagement.tsx      # Task CRUD operations
│   │   │   ├── UserManagement.tsx      # User CRUD operations
│   │   │   └── index.ts                # Barrel export
│   │   │
│   │   └── shared/             # Shared/Reusable Components
│   │       ├── TrackerGrid.tsx # Time tracking grid component
│   │       └── index.ts        # Barrel export
│   │
│   ├── constants/              # Application Constants
│   │   └── index.ts           # Mock data & constant values
│   │
│   ├── types/                  # TypeScript Type Definitions
│   │   └── index.ts           # All type definitions & interfaces
│   │
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
│
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation

```

## Component Organization Strategy

### 1. Feature-Based Structure
Components are organized by feature/domain rather than technical type:
- ✅ `components/employee/EmployeeDashboard.tsx`
- ❌ `components/dashboards/EmployeeDashboard.tsx`

### 2. Barrel Exports
Each feature folder contains an `index.ts` for clean imports:

```typescript
// src/components/employee/index.ts
export { EmployeeDashboard } from './EmployeeDashboard';
export { EmployeeInspection } from './EmployeeInspection';
```

Usage:
```typescript
// ✅ Clean import
import { EmployeeDashboard, EmployeeInspection } from './components/employee';

// ❌ Verbose import
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeInspection } from './components/employee/EmployeeInspection';
```

### 3. Type Centralization
All TypeScript types are in `src/types/index.ts`:
- User, UserRole
- TimeEntry, EntryStatus
- Task, Vertical
- Component Props interfaces

### 4. Constants Centralization
All constants and mock data in `src/constants/index.ts`:
- MOCK_USERS
- MOCK_TASKS
- MOCK_VERTICALS
- MOCK_TIME_ENTRIES

## Import Path Examples

### From App.tsx:
```typescript
import { User, TimeEntry } from './types';
import { MOCK_USERS } from './constants';
import { AuthView } from './components/auth';
import { Layout } from './components/layout';
import { EmployeeDashboard } from './components/employee';
```

### From a Component (e.g., EmployeeDashboard.tsx):
```typescript
import { User, TimeEntry } from '../../types';
import { TrackerGrid } from '../shared';
```

## Adding New Components

### 1. Create the component in the appropriate feature folder:
```
src/components/[feature]/[ComponentName].tsx
```

### 2. Update the barrel export:
```typescript
// src/components/[feature]/index.ts
export { NewComponent } from './NewComponent';
```

### 3. Import and use:
```typescript
import { NewComponent } from './components/[feature]';
```

## Adding New Features

To add a new feature module:

1. Create folder: `src/components/[feature-name]/`
2. Add components: `[feature-name]/ComponentName.tsx`
3. Create barrel export: `[feature-name]/index.ts`
4. Export components from the barrel file

## File Naming Conventions

- **Components**: PascalCase (e.g., `EmployeeDashboard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: index.ts or descriptive name
- **Constants**: index.ts or descriptive name
- **Barrel Exports**: Always `index.ts`

## Benefits of This Structure

1. **Scalability**: Easy to add new features without disrupting existing code
2. **Maintainability**: Related files are co-located
3. **Discoverability**: Clear feature boundaries make finding code intuitive
4. **Clean Imports**: Barrel exports reduce import verbosity
5. **Type Safety**: Centralized types ensure consistency
6. **Separation of Concerns**: Clear boundaries between features

## Migration Notes

The project was restructured from a flat component structure to this feature-based organization. All imports have been updated to reflect the new paths.

### Key Changes:
- Moved from root `components/` to `src/components/[feature]/`
- Added barrel exports for each feature
- Centralized types and constants
- Updated `index.tsx` → `main.tsx`
- Moved static assets to `public/`

## Tech Stack

- **React 18.2**: Modern React with hooks
- **TypeScript**: Full type safety
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling (CDN)
- **Recharts**: Data visualization
- **Lucide React**: Icon library

---

Last Updated: January 2026
