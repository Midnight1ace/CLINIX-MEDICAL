from typing import Literal

from pydantic import BaseModel


class RiskItem(BaseModel):
    level: Literal["low", "medium", "high"]
    title: str
    rationale: str
    source: Literal["rule", "llm"] = "rule"
