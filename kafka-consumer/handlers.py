import json
from external_services import get_user_profile, get_song_by_id, ensure_dimension
import psycopg2
import os
from utils import parse_time_dim

def handle_play_event(message: bytes):
    try:
        data = json.loads(message.decode('utf-8'))
        print(f"Received play event: {data}")
       
        user_info = get_user_profile(data['User_Id'])
        song_info = get_song_by_id(data['Song_Id'])

        if not user_info or not song_info:
            print("User or song information not found, skipping event.")
            return
        
        user_dim = user_info["profile"]
        song_dim = song_info["data"]["song"]
        album_dim = song_info["data"]["song"]["album"]
        artists_dim = song_info["data"]["song"]["artists"]
        city = user_info["profile"]["city"]["name"]
        country = user_info["profile"]["city"]["country"]["name"]
        time_dim = parse_time_dim(data["Played_At"])

        conn = psycopg2.connect(
            host=os.environ["ANALYSIS_DB_HOST"],
            dbname=os.environ["ANALYSIS_DB_NAME"],
            user=os.environ["ANALYSIS_DB_USER"],
            password=os.environ["ANALYSIS_DB_PASSWORD"]
        )

        cursor = conn.cursor()

        user_id = ensure_dimension(cursor, "dimuser", "externaluserid", {
            "externaluserid": user_dim["auth_id"],
            "username": user_dim["name"],
            "birthdate": user_dim["birthday"]
        })
        

        song_id = ensure_dimension(cursor, "dimsong", "externalsongid", {
            "externalsongid": song_dim["id"],
            "title": song_dim["title"],
            "duration": song_dim["duration"],
            "tracknumber": song_dim["track_number"],
            "createdat": song_dim["created_at"],
        })

        album_id = ensure_dimension(cursor, "dimalbum", "externalalbumid", {
            "externalalbumid": album_dim["id"],
            "name": album_dim["title"],
            "albumimageurl": album_dim["image_url"]
        })

        artist = artists_dim[0]
        artist_id = ensure_dimension(cursor, "dimartist", "artistexternalid", {
            "artistexternalid": artist["id"],
            "artistname": artist["name"],
            "imageurl": artist["image_url"]
        })

        location_id = ensure_dimension(cursor, "dimlocation", "city", {
            "city": city,
            "country": country
        })

        time_id = ensure_dimension(cursor, "dimtime", "id", time_dim)

        cursor.execute(
            "INSERT INTO public.factsongplayed (userid, songid, artistid, timekey, locationid, albumid, durationplayedseconds) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user_id, song_id, artist_id, time_id, location_id, album_id, data.get("Duration_Played"))
        )

        conn.commit()
        print("✅ Song play event inserted successfully.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Failed to process play event: {e}")
