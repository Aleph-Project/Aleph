from handlers import handle_play_event

def dispatch(topic: str, message: bytes):
    if topic == "song-played-topic":
        handle_play_event(message)
    else:
        print(f"No handler for topic {topic}")
