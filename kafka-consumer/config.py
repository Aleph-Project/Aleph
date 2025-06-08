import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC_SONG_PLAYED_NAME = os.getenv("TOPIC_SONG_PLAYED_NAME", "song-played-topic")
GROUP_ID = os.getenv("GROUP_ID", "song-played-group")
DB_URL = os.getenv("DB_URL", "postgresql://user:pass@host:5432/dbname")
PROFILE_DB_HOST = os.getenv("PROFILE_DB_HOST", "profile-db-host")
PROFILE_DB_NAME = os.getenv("PROFILE_DB_NAME", "analysis_db")
PROFILE_DB_USER = os.getenv("PROFILE_DB_USER", "profile_user")
PROFILE_DB_PASSWORD = os.getenv("PROFILE_DB_PASSWORD", "profile_password")
