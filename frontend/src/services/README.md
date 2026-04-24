# Services

External API and service integrations.

## Services

- **api.js** - API client for backend communication
  - `analyzePatient(rawText)` - POST to `/api/analyze`
  - Handles base URL from environment
  - Error handling

## Configuration

The API base URL is configured via environment variable:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Default: `http://localhost:8000`

## Usage

```jsx
import { analyzePatient } from '@/services/api';

const result = await analyzePatient("Patient notes...");
```

## Extending

Add new API endpoints to `api.js` as functions. Consider:
- Request/response type definitions in `types/api.js`
- Error handling consistency
- Loading states in calling components
