# CLINIX

Multi-agent clinical workflow engine demo. One input, one clean pipeline.

## Structure

- backend: FastAPI + agents
- frontend: Next.js dashboard
- data: mock patient records
- docs: architecture and demo script
- scripts: local helpers

## Quick Start

Backend

```
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend

```
cd frontend
npm install
npm run dev
```

Open the UI at http://localhost:3000

## API

POST /api/analyze

Body

```
{
  "raw_text": "45-year-old male with chest pain and shortness of breath. BP 150/95, HR 110, temp 37.8. Taking aspirin."
}
```
