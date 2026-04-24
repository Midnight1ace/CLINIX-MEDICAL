# Layout Components

Components that define the overall page structure and navigation.

## Components

- **DoctorShell** - Main dashboard layout with sidebar
  - Provides navigation sidebar with all sections
  - Handles authentication guard for doctor role
  - Wraps all protected doctor pages

## Usage

```jsx
import DoctorShell from '@/components/layout/DoctorShell';

export default function Page() {
  return (
    <DoctorShell active="patients">
      <main>Page content</main>
    </DoctorShell>
  );
}
```

## Navigation Sections

The navigation structure is defined in `config/routes.js` and includes:
- **Main**: Dashboard, Patients, Add Patient, Compare
- **Analytics**: Alerts, Reports, Simulation Lab
- **System**: System Docs, Settings
