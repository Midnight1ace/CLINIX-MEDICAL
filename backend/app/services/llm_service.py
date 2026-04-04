from __future__ import annotations

from typing import Optional

from ..config import settings


class LLMService:
    def __init__(self) -> None:
        self.provider = settings.llm_provider.lower()
        self.model = settings.openai_model
        self.client: Optional[object] = None

        if self.provider == "openai" and settings.openai_api_key:
            try:
                from openai import OpenAI

                self.client = OpenAI(api_key=settings.openai_api_key)
            except Exception:
                self.client = None

    def generate_text(self, prompt: str) -> str:
        if self.provider == "openai" and self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
                return response.choices[0].message.content.strip()
            except Exception:
                return ""

        return ""
