# Components

Reusable UI components organized by purpose.

## Directory Structure

### `layout/`
Layout components that define page structure and navigation.
- `DoctorShell.jsx` - Main doctor dashboard layout with sidebar navigation
- `Sidebar.jsx` - Navigation sidebar component

### `clinical/`
Clinical workflow-specific components for patient data and analysis.
- `PatientList.jsx` - List of patients with status badges
- `PatientDetail.jsx` - Detailed patient view with analysis
- `PatientForm.jsx` - Form for adding/editing patients
- `SummaryCard.jsx` - Clinical summary display
- `RiskAlerts.jsx` - Risk indicators and alerts
- `Recommendations.jsx` - Treatment recommendations list
- `Timeline.jsx` - Patient history timeline
- `StatCard.jsx` - Simple statistics cards
- `PipelineView.jsx` - Multi-agent pipeline visualization

### `panels/`
Feature panels for data display and interaction.
- `InputPanel.jsx` - Text input with analyze button
- `AlertsPanel.jsx` - Alerts monitoring with threshold control
- `ReportPanel.jsx` - Report generation and export
- `InsightsPanel.jsx` - Advanced insights and correlations
- `ComparisonPanel.jsx` - Side-by-side patient comparison

### `modals/`
Modal dialog components.
- `ExplainabilityModal.jsx` - Shows explainability details for AI decisions

### `common/`
Generic, reusable UI primitives.
- `Button.jsx` - Button component (future)
- `Card.jsx` - Card component (future)
- `Badge.jsx` - Badge/tag component (future)

## Usage

```javascript
// Import from specific subdirectories
import DoctorShell from '@/components/layout/DoctorShell';
import PatientList from '@/components/clinical/PatientList';
import InputPanel from '@/components/panels/InputPanel';
```

## Naming Conventions

- Components: PascalCase (`PatientList.jsx`)
- Directories: kebab-case (`clinical/`)
- Barrel exports via `index.js` available for clean imports
