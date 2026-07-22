import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class SimpleRateLimiter:
    """Lightweight in-memory sliding window rate limiter."""

    def __init__(self, requests_per_minute: int = 120):
        self.requests_per_minute = requests_per_minute
        self.client_records = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        self.client_records[client_ip] = [
            t for t in self.client_records[client_ip] if t > window_start
        ]

        if len(self.client_records[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Rate limit exceeded.",
            )

        self.client_records[client_ip].append(now)


rate_limiter = SimpleRateLimiter(requests_per_minute=120)
