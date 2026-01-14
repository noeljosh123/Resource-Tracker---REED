# Enterprise Resource Tracker - REED

A professional resource tracking application built with React, TypeScript, and Vite.

## 📁 Project Structure

```
├── public/                  # Static assets
│   └── relx.png            # Company logo
├── src/                     # Source code
│   ├── components/          # React components (organized by feature)
│   │   ├── auth/           # Authentication components
│   │   │   ├── Auth.tsx
│   │   │   └── index.ts
│   │   ├── employee/       # Employee-specific components
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── EmployeeInspection.tsx
│   │   │   └── index.ts
│   │   ├── layout/         # Layout components
│   │   │   ├── Layout.tsx
│   │   │   └── index.ts
│   │   ├── manager/        # Manager-specific components
│   │   │   ├── ManagerApprovals.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── TaskManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── index.ts
│   │   └── shared/         # Shared/reusable components
│   │       ├── TrackerGrid.tsx
│   │       └── index.ts
│   ├── constants/          # Application constants
│   │   └── index.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## 🏗️ Architecture

### Component Organization

The project follows a feature-based component structure:

- **auth/**: Authentication and login components
- **employee/**: Employee dashboard, inspection, and time tracking
- **manager/**: Manager dashboard, approvals, task and user management
- **layout/**: Application shell, navigation, and layout components
- **shared/**: Reusable components used across features (e.g., TrackerGrid)

### Barrel Exports

Each component folder includes an `index.ts` file for clean imports:

```typescript
// Instead of:
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';

// Use:
import { EmployeeDashboard } from './components/employee';
```

### Type Safety

All TypeScript types and interfaces are centralized in `src/types/index.ts`, ensuring type consistency across the application.

### Constants

Application-wide constants and mock data are stored in `src/constants/index.ts` for easy maintenance.

## 📝 Development Guidelines

1. **Component Placement**: Place new components in the appropriate feature folder
2. **Exports**: Update the `index.ts` barrel export when adding new components
3. **Types**: Add new types to `src/types/index.ts`
4. **Constants**: Add new constants to `src/constants/index.ts`
5. **Imports**: Use barrel exports for cleaner import statements

## 🎨 Tech Stack

- **React 18.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## 📄 License

Proprietary - RELX/Reed
