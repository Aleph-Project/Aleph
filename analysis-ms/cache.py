import os
import redis
import json
import logging

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# Variable global para controlar si Redis está disponible
redis_available = False
r = None

try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)
    # Probar conexión
    r.ping()
    redis_available = True
    logging.info(f"Redis conectado exitosamente en {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    redis_available = False
    logging.warning(f"Redis no disponible: {e}. El servicio funcionará sin cache.")

def get_cache(key: str):
    if not redis_available or r is None:
        return None
    
    try:
        cached = r.get(key)
        if cached:
            return json.loads(cached)
        return None
    except Exception as e:
        logging.error(f"Error al obtener cache para {key}: {e}")
        return None

def set_cache(key: str, value, expire_seconds: int = 300):
    if not redis_available or r is None:
        return
    
    try:
        r.setex(key, expire_seconds, json.dumps(value))
    except Exception as e:
        logging.error(f"Error al establecer cache para {key}: {e}")
