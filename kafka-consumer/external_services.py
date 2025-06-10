import requests

def get_user_profile(auth_id: str):
    """
    Fetch user profile from an external service.
    """
    url = f"http://apigateway:8080/api/v1/profiles/my-profile/{auth_id}"

    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"Error fetching user profile: {e}")
        return None
    

def get_song_by_id(song_id):
    url = "http://apigateway:8080/api/v1/music/graphql"
    query = {
        "query": f"""query GetSongById {{ song(id: "{song_id}") {{ id title duration spotify_id album_id track_number audio_url created_at updated_at album {{ id title image_url }} artists {{ id name image_url }} }} }}"""
    }
    try:
        resp = requests.post(url, json=query, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching song: {e}")
        return None
    

def ensure_dimension(cursor, table, unique_column, data):
    """
    Inserta un registro en la tabla de dimensión si no existe y retorna su id.
    - cursor: cursor de psycopg2
    - table: nombre de la tabla
    - unique_column: columna única para buscar el registro (ej: 'auth_id', 'id', etc.)
    - data: dict con los datos a insertar
    """
    # Buscar si ya existe
    cursor.execute(
        f"SELECT id FROM {table} WHERE {unique_column} = %s",
        (data[unique_column],)
    )
    row = cursor.fetchone()
    if row:
        return row[0]
    # Insertar si no existe
    cols = ', '.join(data.keys())
    vals = ', '.join(['%s'] * len(data))
    cursor.execute(
        f"INSERT INTO {table} ({cols}) VALUES ({vals}) RETURNING id",
        tuple(data.values())
    )
    return cursor.fetchone()[0]