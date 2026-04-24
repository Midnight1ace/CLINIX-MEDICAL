# Config

Application configuration and constants.

## Files

- **index.js** - Main configuration exports
  - `APP_NAME`, `APP_DESCRIPTION`
  - `RISK_LEVELS`, `PRIORITY_LEVELS`, `STATUS_TYPES`
  - `STORAGE_KEYS`
  - `API_CONFIG`
  - `CLINICAL_CONFIG`

- **routes.js** - Route path constants and navigation config
  - `ROUTES` - All route paths as constants
  - `NAV_SECTIONS` - Navigation structure for sidebar

## Usage

```jsx
import { ROUTES, NAV_SECTIONS } from '@/config';
import { RISK_LEVELS, STORAGE_KEYS } from '@/config';

// Use constants throughout app
const { HIGH, CRITICAL } = RISK_LEVELS;
const STORAGE_KEY = STORAGE_KEYS.PATIENTS;
```

## Benefits

Centralized configuration makes it easy to:
- Change route paths in one place
- Update storage keys consistently
- Modify clinical thresholds
- Maintain consistent constants across components
