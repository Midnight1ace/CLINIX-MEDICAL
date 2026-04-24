# Common Components

Generic, reusable UI primitives used throughout the application.

## Components

- **StatCard** - Displays a single statistic with label
- *(Future components: Button, Card, Badge, Input, etc.)*

## Usage

```jsx
import StatCard from '@/components/common/StatCard';

<StatCard
  label="Risk Score"
  value="Critical"
  subvalue="(7.2)"
/>
```

## Styling

Components use Tailwind CSS utility classes and follow the design system defined in `styles/globals.css`.
