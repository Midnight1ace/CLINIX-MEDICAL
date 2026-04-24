# Mock Data

Static or generated data for development and testing.

## Contents

- `mock_patient.json` - Sample patient record for demo/testing

## Generated Data

Running `scripts/seed_data.py` creates:
- `seed_patients.json` - 5 mock patient notes for seeding the database

## Usage

Data files can be imported into the frontend or backend for seeding test databases, demo accounts, or sample payloads.

```javascript
import samplePatients from '@/data/seed_patients.json';
```

Or in Python:
```python
import json
with open('data/seed_patients.json') as f:
    patients = json.load(f)
```

## Guidelines

- Keep data files small and focused
- Document data schemas with comments or separate schema files
- Never commit real patient data; use synthetic data only
