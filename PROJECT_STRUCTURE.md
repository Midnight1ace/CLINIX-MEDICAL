# CLINIX Project Structure

Standardized directory hierarchy for the CLINIX multi-agent clinical workflow engine.

## Root Layout

```
CLINIX/
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── docker-compose.yml      # Docker services (frontend, backend, db)
├── README.md              # Project overview and quick start
├── LICENSE                # MIT License
├── PROJECT_STRUCTURE.md   # This file
│
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   ├── agents/
│   │   └── utils/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/              # Next.js React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Organized by type
│   │   │   ├── layout/   # Layout components
│   │   │   ├── clinical/ # Clinical workflow components
│   │   │   ├── panels/   # Feature panels
│   │   │   ├── modals/   # Modal dialogs
│   │   │   └── common/   # Reusable UI primitives
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   ├── utils/        # Utility functions
│   │   ├── config/       # App configuration
│   │   ├── types/        # Type definitions
│   │   ├── styles/       # Global CSS
│   │   ├── assets/       # Static assets
│   │   └── lib/          # Third-party integrations
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/                  # Project documentation
│   ├── architecture/     # Architecture docs
│   ├── api/              # API reference
│   ├── agent-flow.md     # Agent flow explanation
│   └── README.md         # Docs index
│
├── scripts/               # Dev & deployment scripts
│   ├── seed_data.py
│   ├── simulate_patient.py
│   ├── test_pipeline.py
│   └── README.md
│
├── data/                  # Mock/static data
│   ├── mock_patient.json
│   └── README.md
│
├── .kilo/                 # Kilo CLI configuration
└── AGENTS.md              # Agent definitions (future)
```

## Frontend Structure Details

### Component Organization

```
components/
├── layout/     # Shell, Sidebar, Header - page structure
├── clinical/   # PatientList, PatientDetail, SummaryCard, RiskAlerts
├── panels/     # InputPanel, AlertsPanel, ReportPanel, InsightsPanel
├── modals/     # ExplainabilityModal
├── common/     # StatCard, Button, Card (future)
└── index.js    # Barrel exports (future)
```

**Rationale:** Separating by UI concern makes it easy to find components. Clinical components are domain-specific, panels are feature containers, layout defines structure, common are primitives.

### Module Purposes

- **app/** - Next.js App Router pages (route handlers)
- **hooks/** - Stateful logic (useClinic, useAnalysis)
- **services/** - External API interactions (api.js)
- **utils/** - Pure utilities (constants, helpers, sanitization)
- **config/** - App configuration (routes, constants, API settings)
- **types/** - Type definitions (patient, analysis schemas)
- **lib/** - Domain logic and third-party integrations
- **styles/** - Tailwind + global CSS
- **assets/** - Images, icons, custom fonts

## Backend Structure

```
backend/app/
├── main.py              # FastAPI app entry point
├── api/
│   ├── v1/
│   │   ├── endpoints.py # Route definitions
│   │   └── schemas.py   # Request/response models
├── core/
│   ├── config.py        # Settings from env
│   └── security.py      # Auth, CORS middleware
├── models/
│   ├── patient.py       # SQLAlchemy/DataClass models
│   └── analysis.py      # Analysis result models
├── services/
│   ├── analysis_service.py
│   └── patient_service.py
├── agents/
│   ├── base_agent.py
│   ├── rule_engine.py   # Rule-based reasoning
│   └── llm_agent.py     # LLM-powered reasoning
└── utils/
    ├── helpers.py
    └── validators.py
```

## Naming Conventions

- **Directories:** kebab-case (`clinical`, `patient-detail`)
- **Files:** kebab-case for utils/config (`api.js`, `routes.js`)
- **Components:** PascalCase (`PatientList.jsx`, `DoctorShell.jsx`)
- **Hooks:** camelCase with `use` prefix (`useClinic.js`, `useAnalysis.js`)
- **Constants:** UPPER_SNAKE_CASE (`RISK_LEVELS`, `STORAGE_KEYS`)

## Import Paths

Use absolute imports from `src/` root via `@/` alias:

```javascript
import DoctorShell from '@/components/layout/DoctorShell';
import { useClinic } from '@/hooks/useClinic';
import { analyzePatient } from '@/services/api';
import { RISK_LEVELS } from '@/config';
```

*(Requires `jsconfig.json` path mapping - to be added)*

## Configuration Files

Root-level config:
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS settings
- `jsconfig.json` - Path aliases (optional)

## Documentation

All major directories include a `README.md` explaining:
- Purpose of the directory
- Components/modules contained
- Usage examples

Root-level docs in `docs/` cover:
- Architecture decisions
- API reference
- Demo instructions

## CI/CD & DevOps

- `Dockerfile` (backend) and Docker Compose for local dev
- Frontend builds with `next build`
- Backend runs with `uvicorn`

## Contributing

When adding new code:
1. Place files in the appropriate module directory
2. Update relevant `README.md` if adding new component type
3. Keep imports consistent with established patterns
4. Add JSDoc comments for public functions
