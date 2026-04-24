# Clinical Components

Components for displaying and interacting with patient medical data and clinical workflows.

## Components

- **PatientList** - Searchable list of patients with status badges
- **PatientDetail** - Comprehensive patient view with analysis results
- **PatientForm** - Form for creating/editing patient records
- **SummaryCard** - Displays clinical summary with structured data
- **RiskAlerts** - List of risk indicators with severity levels
- **Recommendations** - Treatment recommendations display
- **Timeline** - Patient history chronological view
- **StatCard** - Simple statistics display card
- **PipelineView** - Multi-agent reasoning step visualization

## Data Flow

Clinical components primarily consume data from the `useClinic` hook, which provides:
- Patient records
- Analysis results (`latestRun`)
- Historical data
- Alerts and similar cases

## Usage

```jsx
import { useClinic } from '@/hooks/useClinic';
import PatientDetail from '@/components/clinical/PatientDetail';

export default function Page() {
  const { selectedPatient, latestRun } = useClinic();
  
  return (
    <PatientDetail 
      patient={selectedPatient}
      latestRun={latestRun}
      history={selectedPatient?.history}
    />
  );
}
```
