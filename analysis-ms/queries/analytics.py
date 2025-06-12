from db import get_connection

def get_top_songs(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT ds.title, da.albumimageurl, COUNT(*) as play_count
    FROM factsongplayed f
    JOIN dimsong ds ON f.songid = ds.id
    JOIN dimalbum da ON f.albumid = da.id
    GROUP BY ds.title, da.albumimageurl
    ORDER BY play_count DESC
    LIMIT %s;
    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{"title": r[0], "album_image_url": r[1], "plays": r[2]} for r in rows]



def get_top_albums(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT da.name, da.albumimageurl, COUNT(*) as play_count
    FROM factsongplayed f
    JOIN dimalbum da ON f.albumid = da.id
    GROUP BY da.name, da.albumimageurl
    ORDER BY play_count DESC
    LIMIT %s;
    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{"album": r[0], "album_image_url": r[1], "plays": r[2]} for r in rows]


def get_top_songs_by_country(country: str, limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT ds.title, da.albumimageurl, COUNT(*) as play_count
    FROM factsongplayed f
    JOIN dimsong ds ON f.songid = ds.id
    JOIN dimalbum da ON f.albumid = da.id
    JOIN dimlocation dl ON f.locationid = dl.id
    WHERE dl.country = %s
    GROUP BY ds.title, da.albumimageurl
    ORDER BY play_count DESC
    LIMIT %s;
    """

    cursor.execute(query, (country, limit))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{"title": r[0], "album_image_url": r[1],"plays": r[2]} for r in rows]

def get_top_artists(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT da.artistname, da.imageurl, COUNT(*) as play_count
    FROM factsongplayed f
    JOIN dimartist da ON f.artistid = da.id
    GROUP BY da.artistname, da.imageurl
    ORDER BY play_count DESC
    LIMIT %s;

    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{"artist": r[0], "plays": r[1]} for r in rows]



def get_most_active_users(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT du.username, COUNT(*) as play_count
    FROM factsongplayed f
    JOIN dimuser du ON f.userid = du.id
    GROUP BY du.username
    ORDER BY play_count DESC
    LIMIT %s;
    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{"user": r[0], "plays": r[1]} for r in rows]
