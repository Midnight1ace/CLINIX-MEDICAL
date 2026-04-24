# Hooks

Custom React hooks for shared stateful logic.

## Hooks

- **useAnalysis** - Manages patient text analysis workflow
  - State: `rawText`, `result`, `loading`, `error`, `showExplain`
  - Methods: `analyze()`, `loadSample()`
  
- **useClinic** - Core clinic state management
  - Manages patients, selection, alerts, similar cases
  - Handles localStorage persistence
  - Simulation and live mode functionality
  - Methods: `addPatient()`, `updatePatient()`, `analyzeForPatient()`, etc.

## Usage

```jsx
import { useClinic } from '@/hooks/useClinic';

export default function Page() {
  const {
    patients,
    selectedPatient,
    alerts,
    addPatient,
    analyzeForPatient
  } = useClinic();
  
  // Use state and methods
}
```

## Design

Hooks encapsulate business logic and state management, keeping components thin. They pull from services and utils for data operations.
