from confluent_kafka import Consumer, KafkaException
import time
from config import KAFKA_BOOTSTRAP_SERVERS, TOPIC_SONG_PLAYED_NAME, GROUP_ID
from dispatcher import dispatch

def start_consumer():
    for i in range(10):
        try:
            consumer = Consumer({
                'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
                'group.id': GROUP_ID,
                'auto.offset.reset': 'earliest',
            })

            consumer.subscribe([TOPIC_SONG_PLAYED_NAME])
            print(f"Subscribed to topic: {TOPIC_SONG_PLAYED_NAME}")
            break
        except KafkaException as e:
            print(f"Kafka not ready, retrying in 5s... ({i+1}/10)")
            time.sleep(5)
    else:
        print("Kafka not available after retries, exiting.")
        return

    try:
        while True:
            print("Waiting for messages...")
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Error: {msg.error()}")
                continue

            dispatch(msg.topic(), msg.value())
    except KeyboardInterrupt:
        print("Stopping consumer...")
    finally:
        consumer.close()
