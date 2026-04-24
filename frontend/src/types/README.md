# Types

TypeScript/JSDoc type definitions and type utilities.

## Files

- **index.js** - Barrel export of all types
- **patient.js** - Patient and clinical data types
- **analysis.js** - Analysis result types (future)
- **api.js** - API request/response types (future)

## Current Types

`patient.js` defines:
```javascript
export const emptyAnalysis = {
  steps: [],
  structured: null,
  summary: "",
  risks: [],
  recommendations: [],
  explainability: []
};
```

## Usage

```jsx
import { emptyAnalysis } from '@/types/patient';
```

## Notes

This project uses JSDoc comments for type hints. Future migration to TypeScript (`.ts` files) is recommended for stronger type safety.
