# Development Scripts

Helper scripts for development, testing, and deployment.

## Scripts

### `seed_data.py`
Generates mock patient records for seeding the demo database.
- Creates 5 sample patient notes with random vitals
- Outputs to `data/seed_patients.json`
- Run: `python scripts/seed_data.py`

### `simulate_patient.py`
Generates a single simulated patient clinical note.
- Random age, symptoms, vitals, medications
- Can be used standalone or imported by other scripts
- Run: `python scripts/simulate_patient.py`

### `test_pipeline.py`
Tests the analysis pipeline end-to-end.
- Sends sample notes to the backend API
- Validates responses
- Run: `python scripts/test_pipeline.py`

## Examples

```bash
# Generate seed data
python scripts/seed_data.py

# Run pipeline test
python scripts/test_pipeline.py
```

## Guidelines

- Scripts should be cross-platform where possible (PowerShell for Windows, bash for Unix)
- Include docstrings/comments explaining purpose
- Make scripts idempotent when feasible
- Add new scripts to this README
