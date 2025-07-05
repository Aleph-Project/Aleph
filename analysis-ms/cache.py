import os
import redis
import json

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

def get_cache(key: str):
    cached = r.get(key)
    if cached:
        return json.loads(cached)
    return None

def set_cache(key: str, value, expire_seconds: int = 300):
    r.setex(key, expire_seconds, json.dumps(value))
