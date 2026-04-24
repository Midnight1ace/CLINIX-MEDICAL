# Utilities

Helper functions and utilities used throughout the backend.

## Modules

- **jwt.py** - JWT token creation, verification, decoding
- **cookies.py** - HTTP-only cookie management
- **sanitize.py** - HTML/sanitize input to prevent XSS
- **security.py** - Password hashing (bcrypt), verification
- **parser.py** - Clinical text parsing (future)
- **rules_engine.py** - Rule-based reasoning engine
- **logger.py** - Audit logging utilities

## Usage

```python
from app.utils.jwt import create_access_token, verify_token
from app.utils.security import hash_password, verify_password
from app.utils.sanitize import sanitize_html
```

## Security Note

Always sanitize user input before processing or storing. Use `sanitize_html()` for any text that may be displayed in HTML contexts.
