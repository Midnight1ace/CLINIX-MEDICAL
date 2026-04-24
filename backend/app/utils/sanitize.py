import html
import re
from typing import Any, Dict, List, Union
from urllib.parse import quote, unquote


def sanitize_html(text: str) -> str:
    """
    Escape HTML special characters to prevent XSS attacks
    """
    if not isinstance(text, str):
        return text
    return html.escape(text, quote=True)


def sanitize_sql_like(text: str) -> str:
    """
    Basic SQL injection prevention - escape SQL wildcards
    Note: Proper SQL injection prevention should use parameterized queries
    """
    if not isinstance(text, str):
        return text
    # Escape SQL LIKE wildcards
    text = text.replace("%", r"\%")
    text = text.replace("_", r"\_")
    # Escape SQL comment sequences
    text = text.replace("--", r"\--")
    text = text.replace("/*", r"/\*")
    text = text.replace("*/", r"\*/")
    return text


def sanitize_path(path: str) -> str:
    """
    Sanitize file paths to prevent directory traversal attacks
    """
    if not isinstance(path, str):
        return path
    # Remove directory traversal attempts
    path = path.replace("..", "")
    path = path.replace("//", "/")
    # Remove leading slash if we don't want absolute paths
    if path.startswith("/"):
        path = path[1:]
    return path


def sanitize_input(data: Any) -> Any:
    """
    Recursively sanitize input data structures
    """
    if isinstance(data, str):
        return sanitize_html(data)
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    else:
        return data


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent dangerous file uploads
    """
    if not isinstance(filename, str):
        return filename
    # Remove dangerous characters
    filename = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", filename)
    # Remove control characters and reserved names
    filename = re.sub(r'[\x00-\x1f\x80-\x9f]', "", filename)
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
        filename = name[:255 - len(ext) - 1] + "." + ext if ext else name[:255]
    return filename.strip()


def sanitize_url(url: str) -> str:
    """
    Sanitize URL to prevent open redirect attacks
    """
    if not isinstance(url, str):
        return url
    # Basic URL validation - in production use proper URL parsing
    dangerous_patterns = [
        r"javascript:",
        r"data:",
        r"vbscript:",
        r"file:",
    ]
    for pattern in dangerous_patterns:
        if re.search(pattern, url, re.IGNORECASE):
            return ""
    return url


class SanitizerMixin:
    """
    Mixin class to add sanitization methods to Pydantic models
    """
    
    @classmethod
    def sanitize_fields(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize all string fields in a dictionary"""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = sanitize_html(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_fields(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    cls.sanitize_fields(item) if isinstance(item, dict)
                    else sanitize_html(item) if isinstance(item, str)
                    else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        return sanitized