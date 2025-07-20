import psycopg2
import logging
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def get_connection():
    try:
        logging.info(f"Intentando conectar a PostgreSQL en {DB_HOST}:{DB_PORT}")
        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        logging.info("Conexión a PostgreSQL exitosa")
        return connection
    except psycopg2.OperationalError as e:
        logging.error(f"Error de conexión a PostgreSQL: {e}")
        raise
    except Exception as e:
        logging.error(f"Error inesperado al conectar a PostgreSQL: {e}")
        raise
