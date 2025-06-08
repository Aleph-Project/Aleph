import json

def handle_play_event(message: bytes):
    try:
        data = json.loads(message.decode('utf-8'))
        print(f"Received play event: {data}")
        # TODO: call microservices and insert into DB
    except Exception as e:
        print(f"Failed to process play event: {e}")
