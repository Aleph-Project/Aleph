from fastapi import APIRouter, Query
from queries.analytics import (
    get_top_songs, get_top_artists, get_top_albums,
    get_top_songs_by_country, get_most_active_users
)

router = APIRouter()

@router.get("/top-songs")
def top_songs(limit: int = Query(10, gt=0, le=100)):
    return get_top_songs(limit)

@router.get("/top-artists")
def top_artists(limit: int = Query(10, gt=0, le=100)):
    return get_top_artists(limit)

@router.get("/top-albums")
def top_albums(limit: int = Query(10, gt=0, le=100)):
    return get_top_albums(limit)

@router.get("/top-songs-by-country")
def top_songs_by_country(country: str, limit: int = Query(10, gt=0, le=100)):
    return get_top_songs_by_country(country, limit)

@router.get("/most-active-users")
def most_active_users(limit: int = Query(10, gt=0, le=100)):
    return get_most_active_users(limit)
