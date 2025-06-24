import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "aleph_message_queue:9092")
TOPIC_SONG_PLAYED_NAME = os.getenv("TOPIC_SONG_PLAYED_NAME", "song-played-topic")
GROUP_ID = os.getenv("GROUP_ID", "song-played-group")
DB_URL = os.getenv("DB_URL", "postgresql://user:pass@host:5432/dbname")
AZURE_DB_HOST = os.getenv("AZURE_DB_HOST", "profile-db-host")
ANALYSIS_DB_NAME = os.getenv("ANALYSIS_DB_NAME", "analysis_db")
AZURE_DB_USER = os.getenv("AZURE_DB_USER", "profile_user")
AZURE_DB_PASSWORD = os.getenv("AZURE_DB_PASSWORD", "profile_password")
