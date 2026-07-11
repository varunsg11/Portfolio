"""Shared rate limiter instance.

slowapi requires the SAME Limiter object on app.state and on every @limiter.limit
decorator, so it lives here and is imported by both main and the routers.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
