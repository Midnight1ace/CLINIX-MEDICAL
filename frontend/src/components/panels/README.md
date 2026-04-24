# Panel Components

Feature panels that provide specific functionality within pages.

## Components

- **InputPanel** - Text area for patient notes with analyze action
- **AlertsPanel** - Monitors high-risk patients with adjustable threshold
- **ReportPanel** - Report generation, export, and sharing tools
- **InsightsPanel** - Advanced pattern analysis and correlations
- **ComparisonPanel** - Side-by-side patient comparison view

## Usage

```jsx
import InputPanel from '@/components/panels/InputPanel';

<InputPanel
  title="Patient Analysis"
  subtitle="Enter clinical notes"
  value={text}
  onChange={setText}
  onAnalyze={handleAnalyze}
  loading={isLoading}
/>
```

## Props

Most panels accept a standard set of props:
- `title` / `subtitle` - Header text
- `loading` - Boolean loading state
- Event handlers: `onAnalyze`, `onChange`, `onThresholdChange`, etc.
- Data props: `alerts`, `report`, `threshold`, `liveMode`, etc.
