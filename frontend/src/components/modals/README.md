# Modal Components

Dialog overlays for focused interactions.

## Components

- **ExplainabilityModal** - Displays detailed explainability data for AI decisions
  - Shows reasoning behind risk assessments
  - Lists confidence scores and contributing factors

## Usage

```jsx
import ExplainabilityModal from '@/components/modals/ExplainabilityModal';

<ExplainabilityModal
  open={showModal}
  onClose={handleClose}
  items={explainabilityData}
/>
```
