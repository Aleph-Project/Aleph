import { NextResponse } from 'next/server';
import { songs } from '@/data/songs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const songId = parseInt(params.id);
  
  if (isNaN(songId)) {
    return NextResponse.json(
      { error: "ID de canción inválido" },
      { status: 400 }
    );
  }

  const song = songs.find(song => song.id === songId);

  if (!song) {
    return NextResponse.json(
      { error: "Canción no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ song });
}