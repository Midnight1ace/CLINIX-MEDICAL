from __future__ import annotations

import json
from pathlib import Path

from simulate_patient import simulate_patient

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "seed_patients.json"


def main() -> None:
    records = [{"raw_text": simulate_patient()} for _ in range(5)]
    OUT.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} records to {OUT}")


if __name__ == "__main__":
    main()
