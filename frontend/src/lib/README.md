# Library

Third-party integrations and complex utilities that don't fit in `utils/`.

## Modules

- **analytics.js** - Analytics/telemetry integration (future)
- **monitoring.js** - Error monitoring and logging (future)
- **clinic.js** - Clinical business logic migrated from `utils/clinic-utils.js`

## Guidelines

Use `lib/` for:
- External service SDK wrappers
- Complex domain logic requiring multiple dependencies
- Code that might have external dependencies

Keep in `utils/` for:
- Pure functions (no side effects)
- Simple transformations
- Formatting helpers
