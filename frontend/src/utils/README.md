# Utilities

Pure utility functions with no side effects.

## Modules

- **constants.js** - App-wide constants (risk levels, storage keys, API config)
- **helpers.js** - General helper functions (future)
- **validators.js** - Input validation utilities (future)
- **formatters.js** - Data formatting (dates, bytes, etc.) (future)
- **calculations.js** - Business calculation logic (future)

## Existing Utils (legacy location)

The following files are currently in `utils/` root and will be migrated:
- `auth.js` - Authentication helpers (moving to `services/auth.js`)
- `clinic-utils.js` - Clinical business logic (moving to `lib/clinic.js`)
- `encryption.js` - Client-side encryption (stays in utils/)
- `sanitize.js` - XSS prevention (stays in utils/)

## Usage

```jsx
import { RISK_LEVELS, STORAGE_KEYS } from '@/utils/constants';
import { encryptData, decryptData } from '@/utils/encryption';
```

## Guidelines

- Functions must be pure (no side effects, no state)
- JSDoc comments required for public functions
- Unit tests recommended for complex logic
