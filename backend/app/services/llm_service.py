from typing import Optional
import re

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

    def _sanitize_prompt(self, prompt: str) -> str:
        """
        Sanitize prompt to prevent prompt injection attacks.
        - Limit length
        - Remove dangerous patterns that attempt to override system behavior
        """
        if not isinstance(prompt, str):
            return ""
        
        # Limit prompt length to prevent DoS via overly long prompts
        max_length = 1000
        if len(prompt) > max_length:
            prompt = prompt[:max_length]
        
        # Remove common prompt injection patterns (case-insensitive)
        # These are examples - in reality, prompt injection is hard to filter completely
        injection_patterns = [
            r"ignore\s+previous\s+instructions",
            r"ignore\s+the\s+above",
            r"disregard\s+previous\s+instructions",
            r"forget\s+everything\s+above",
            r"you\s+are\s+now\s+a\s+different\s+model",
            r"system\s*:\s*",  # Attempt to inject system messages
        ]
        
        for pattern in injection_patterns:
            prompt = re.sub(pattern, "", prompt, flags=re.IGNORECASE)
        
        # Remove excessive whitespace that could be used to hide injections
        prompt = re.sub(r'\s+', ' ', prompt).strip()
        
        return prompt

    def generate_text(self, prompt: str) -> str:
        sanitized_prompt = self._sanitize_prompt(prompt)
        if not sanitized_prompt:
            return ""
        
        if self.provider == "openai" and self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": sanitized_prompt}],
                    temperature=0.2,
                )
                return response.choices[0].message.content.strip()
            except Exception:
                return ""

        return ""
