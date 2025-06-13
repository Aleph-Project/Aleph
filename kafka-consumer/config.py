import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC_SONG_PLAYED_NAME = os.getenv("TOPIC_SONG_PLAYED_NAME", "song-played-topic")
GROUP_ID = os.getenv("GROUP_ID", "song-played-group")
DB_URL = os.getenv("DB_URL", "postgresql://user:pass@host:5432/dbname")
ANALYSIS_DB_HOST = os.getenv("ANALYSIS_DB_HOST", "profile-db-host")
ANALYSIS_DB_NAME = os.getenv("ANALYSIS_DB_NAME", "analysis_db")
ANALYSIS_DB_USER = os.getenv("ANALYSIS_DB_USER", "profile_user")
ANALYSIS_DB_PASSWORD = os.getenv("ANALYSIS_DB_PASSWORD", "profile_password")
