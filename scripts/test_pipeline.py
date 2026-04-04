from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
DATA = ROOT / "data" / "mock_patient.json"

sys.path.append(str(BACKEND))

from app.services.pipeline_service import PipelineService
from app.models.response import AnalysisRequest


def main() -> None:
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    service = PipelineService()
    result = service.run(AnalysisRequest(**payload))
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
