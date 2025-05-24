"use client"

import { Search, X, ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { artists as staticArtists } from "@/data/artists"
import { albums } from "@/data/albums"
import { categories } from "@/data/categories"
// Importamos el servicio con las nuevas interfaces y funciones
import { 
    getAllSongs, 
    getSongById, 
    getAllArtists,
    getAllAlbums,
    getAllGenres,
    getAlbumsFromSongs,
    getSongsByArtist,
    getAlbumsByArtist,
    getArtistDetails,
    Song as SongType, 
    Album as AlbumType,
    Artist as ArtistType,
    Category as CategoryType,
    Genre as GenreType,
    ArtistDetails
} from "@/services/songService"
import { getGenreDetails, GenreDetails } from "@/services/genreService"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtistDetail } from "./artist-detail"
import { GenreDetail } from "./genre-detail"
import { GenresModal } from "./genres-modal"

// Función para agrupar géneros por primera letra (simulando categorías)
function groupGenresByFirstLetter(genres: GenreType[]): CategoryType[] {
    // Crear un mapa para agrupar géneros por la primera letra
    const genreMap = new Map<string, GenreType[]>();
    
    // Colores para las categorías
    const colors = [
        'from-pink-500 to-purple-500',
        'from-yellow-500 to-orange-500',
        'from-red-500 to-red-800',
        'from-blue-400 to-indigo-600',
        'from-purple-400 to-purple-800',
        'from-green-400 to-emerald-600',
        'from-amber-500 to-yellow-800',
        'from-gray-400 to-gray-700',
        'from-teal-400 to-cyan-600'
    ];
    
    // Agrupar los géneros por su primera letra
    genres.forEach(genre => {
        if (!genre.name) return;
        
        const firstLetter = genre.name.charAt(0).toUpperCase();
        if (!genreMap.has(firstLetter)) {
            genreMap.set(firstLetter, []);
        }
        genreMap.get(firstLetter)?.push(genre);
    });
    
    // Convertir el mapa en un array de categorías
    let colorIndex = 0;
    const categories: CategoryType[] = [];
    
    genreMap.forEach((genresInCategory, letter) => {
        categories.push({
            id: letter,
            name: letter,
            image_url: `/placeholder.svg?text=${letter}`,
            color: colors[colorIndex % colors.length],
            genres: genresInCategory
        });
        colorIndex++;
    });
    
    // Ordenar las categorías alfabéticamente
    return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export function MainContent() {
    const [activeTab, setActiveTab] = useState("artistas")
    const [searchTerm, setSearchTerm] = useState("")
    const [apiSongs, setApiSongs] = useState<SongType[]>([]) 
    const [apiAlbums, setApiAlbums] = useState<AlbumType[]>([])
    const [apiArtists, setApiArtists] = useState<ArtistType[]>([]) // Cambiamos a usar el tipo ArtistType
    const [apiCategories, setApiCategories] = useState<CategoryType[]>([]) // Agregamos estado para categorías
    const [selectedArtist, setSelectedArtist] = useState<ArtistType | null>(null)
    const [artistAlbums, setArtistAlbums] = useState<AlbumType[]>([])
    const [artistSongs, setArtistSongs] = useState<SongType[]>([])
    
    // Estados para la vista de detalles de género
    const [selectedGenre, setSelectedGenre] = useState<{id: string, name: string, slug: string, category: string, count: number} | null>(null)
    const [genreArtists, setGenreArtists] = useState<ArtistType[]>([])
    const [genreAlbums, setGenreAlbums] = useState<AlbumType[]>([])
    const [genreSongs, setGenreSongs] = useState<SongType[]>([])
    
    // Estado para el modal de géneros
    const [isGenresModalOpen, setIsGenresModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
    
    const [viewMode, setViewMode] = useState<"normal" | "artist-detail" | "genre-detail">("normal")
    const [searchResults, setSearchResults] = useState<{
        artists: { id: number | string; name: string; imageUrl: string }[],
        albums: { id: number | string; title: string; artist: string; coverUrl: string }[],
        songs: SongType[], // Modificamos para usar el tipo SongType
    }>({
        artists: [],
        albums: [],
        songs: [],
    })
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingError, setLoadingError] = useState<string | null>(null) // Para manejar errores de carga

    const tabs = [
        { key: "artistas", label: "Artistas" },
        { key: "albums", label: "Albums" },
        { key: "categorias", label: "Categorías" },
        { key: "canciones", label: "Canciones" }, // Nuevo tab para mostrar canciones
        { key: "favoritos", label: "Favoritos" },
        { key: "comentarios", label: "Mis comentarios" },
    ]

    // Cargar datos del microservicio
    useEffect(() => {
        async function fetchDataFromApi() {
            try {
                setLoadingError(null)
                setIsLoading(true)
                
                // Cargar canciones
                const songs = await getAllSongs()
                console.log("Canciones cargadas:", songs.length);
                
                // Depurar valores nulos
                const songsWithoutAlbum = songs.filter(song => !song.album).length;
                const songsWithoutArtist = songs.filter(song => !song.artist).length;
                console.log("Canciones sin álbum:", songsWithoutAlbum);
                console.log("Canciones sin artista:", songsWithoutArtist);
                
                setApiSongs(songs)
                
                // Intentar cargar álbumes directamente del API
                try {
                    const albums = await getAllAlbums();
                    console.log(`Álbumes cargados directamente del API: ${albums.length}`);
                    console.log("Lista de álbumes:", albums.map(album => album.title).join(", "));
                    setApiAlbums(albums);
                } catch (albumError) {
                    console.error("Error obteniendo álbumes:", albumError);
                    // Si falla la carga de álbumes, extraerlos de las canciones como fallback
                    const extractedAlbums = getAlbumsFromSongs(songs);
                    console.log(`Álbumes extraídos de canciones: ${extractedAlbums.length}`);
                    setApiAlbums(extractedAlbums);
                }
                
                // Cargar artistas directamente del endpoint de artistas
                try {
                    const artists = await getAllArtists();
                    console.log(`Artistas cargados de la API: ${artists.length}`);
                    console.log("Lista de artistas:", artists.map(artist => artist.name).join(", "));
                    setApiArtists(artists);
                } catch (artistError) {
                    console.error("Error obteniendo artistas:", artistError);
                    // Si falla la carga de artistas, intentar extraerlos de las canciones como fallback
                    extractArtistsFromSongs(songs);
                }
                
                // Cargar géneros desde la API
                try {
                    const genres = await getAllGenres();
                    console.log(`Géneros cargados del API: ${genres.length}`);
                    
                    // Agrupar los géneros por primera letra para simular categorías
                    const groupedGenres = groupGenresByFirstLetter(genres);
                    setApiCategories(groupedGenres);
                } catch (genreError) {
                    console.error("Error obteniendo géneros:", genreError);
                    // Si fallan los géneros, se mostrará el contenido estático
                }
                
                setIsLoading(false)
            } catch (error) {
                console.error("Error cargando datos:", error)
                setLoadingError("No se pudieron cargar los datos del servicio. Usando datos de ejemplo.")
                setIsLoading(false)
            }
        }

        fetchDataFromApi()
    }, [])
    
    // Función para extraer artistas únicos de las canciones (como fallback)
    const extractArtistsFromSongs = (songs: SongType[]) => {
        const artistMap = new Map<string, ArtistType>();
        let validArtistCount = 0;
        
        songs.forEach(song => {
            // Solo procesar canciones con información de artista
            if (song.artist && song.artist !== "null" && song.artist !== "undefined") {
                validArtistCount++;
                // Usar el artista como clave única
                const artistKey = song.artist;
                
                if (!artistMap.has(artistKey)) {
                    console.log(`Agregando artista: ${song.artist}`);
                    artistMap.set(artistKey, {
                        id: artistKey,
                        name: song.artist,
                        image_url: song.cover_url // Usamos la portada de la canción como imagen del artista
                    });
                }
            }
        });
        
        // Convertir el mapa a un array
        const extractedArtists = Array.from(artistMap.values());
        console.log(`Canciones con artista válido: ${validArtistCount}`);
        console.log(`Artistas únicos extraídos: ${extractedArtists.length}`);
        console.log("Lista de artistas:", extractedArtists.map(artist => artist.name).join(", "));
        setApiArtists(extractedArtists);
    };
    
    // Función para manejar la selección de un artista
    const handleArtistSelect = async (artist: ArtistType) => {
        setIsLoading(true);
        try {
            console.log(`Seleccionado artista: ${artist.name}`);
            
            // Usar el servicio centralizado para obtener los detalles del artista
            const artistDetails = await getArtistDetails(artist.id);
            
            console.log("Detalles del artista recibidos en main-content:", artistDetails);
            
            // Asegurarnos de que artist tenga las propiedades necesarias
            const processedArtist = artistDetails.artist || {};
            
            // Si no tiene image_url, intentar obtenerla de otras fuentes
            if (!processedArtist.image_url) {
                processedArtist.image_url = artistDetails.image_url || artist.image_url || "/placeholder.svg";
                console.log("Main-content: Adaptando imagen del artista:", processedArtist.image_url);
            }
            
            // Asegurarnos de que tenga un ID
            if (!processedArtist.id) {
                processedArtist.id = artist.id;
                console.log("Main-content: Asignando ID al artista:", processedArtist.id);
            }
            
            // Asegurarnos de que tenga un nombre
            if (!processedArtist.name) {
                processedArtist.name = artist.name;
                console.log("Main-content: Asignando nombre al artista:", processedArtist.name);
            }
            
            // Procesar álbumes para asegurar que tienen coverUrl
            const processedAlbums = (artistDetails.albums || []).map((album: any) => {
                if (!album.coverUrl) {
                    album.coverUrl = album.cover_url || album.image_url || "/placeholder.svg";
                    console.log("Main-content: Adaptando imagen del álbum:", album.coverUrl);
                }
                return album;
            });
            
            // Procesar canciones para asegurarse de que tengan toda la información correcta
            const processedSongs = (artistDetails.songs || []).map((song: any) => {
                // Si la canción no tiene referencia a su álbum, tratar de encontrarla
                if (!song.album || song.album === "Álbum desconocido") {
                    // Buscar por album_id primero si está disponible
                    const songAlbumById = processedAlbums.find(album => album.id === song.album_id);
                    
                    if (songAlbumById) {
                        song.album = songAlbumById.title;
                        console.log(`Main-content: Asignando álbum a canción por ID: ${song.album}`);
                    }
                }
                return song;
            });
            
            // Actualizar los estados con la información obtenida
            setSelectedArtist(processedArtist);
            setArtistAlbums(processedAlbums);
            setArtistSongs(processedSongs);
            
            // Cambiar el modo de vista
            setViewMode("artist-detail");
            
            // Cambiar a la pestaña de artistas para asegurar que se muestra la vista correcta
            setActiveTab("artistas");

            // Scroll hacia arriba suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error(`Error al obtener datos del artista ${artist.name}:`, error);
            // En caso de error, mostrar solo la información básica del artista
            setSelectedArtist(artist);
            setArtistAlbums([]);
            setArtistSongs([]);
            setViewMode("artist-detail");
            setActiveTab("artistas");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Función para manejar la selección de un género
    const handleGenreSelect = async (genre: {id: string, name: string, slug: string, category: string, count: number}) => {
        setIsLoading(true);
        try {
            console.log(`Seleccionado género/categoría: ${genre.name}`);
            
            // Determinar si estamos seleccionando una categoría completa
            // Si el nombre del género coincide con el nombre de una categoría
            const isCategory = apiCategories.some(cat => cat.name === genre.name);
            
            if (isCategory) {
                console.log(`Seleccionada categoría: ${genre.name}`);
                
                // Buscar la categoría correspondiente
                const selectedCat = apiCategories.find(cat => cat.name === genre.name);
                
                if (selectedCat && selectedCat.genres && selectedCat.genres.length > 0) {
                    console.log(`La categoría ${genre.name} tiene ${selectedCat.genres.length} géneros`);
                    
                    // Recopilar todas las canciones de todos los géneros de esta categoría
                    let allSongs: SongType[] = [];
                    let allArtists: ArtistType[] = [];
                    let allAlbums: AlbumType[] = [];
                    
                    // Procesamos uno por uno los géneros para obtener sus canciones
                    for (const g of selectedCat.genres.slice(0, 5)) { // Limitamos a 5 géneros para evitar demasiadas peticiones
                        try {
                            console.log(`Obteniendo canciones del género: ${g.name}`);
                            const details = await getGenreDetails(g.slug);
                            allSongs = [...allSongs, ...(details.songs || [])];
                            allArtists = [...allArtists, ...(details.artists || [])];
                            allAlbums = [...allAlbums, ...(details.albums || [])];
                        } catch (error) {
                            console.error(`Error al obtener canciones del género ${g.name}:`, error);
                        }
                    }
                    
                    // Eliminar duplicados
                    const uniqueSongs = removeDuplicates(allSongs, '_id');
                    const uniqueArtists = removeDuplicates(allArtists, 'id');
                    const uniqueAlbums = removeDuplicates(allAlbums, 'id');
                    
                    console.log(`Total de canciones en la categoría ${genre.name}: ${uniqueSongs.length}`);
                    
                    // Actualizar los estados
                    setSelectedGenre({
                        id: selectedCat.id,
                        name: selectedCat.name,
                        slug: 'category', // Indicador especial para categoría
                        category: "Categoría",
                        count: uniqueArtists.length
                    });
                    setGenreSongs(uniqueSongs);
                    setGenreArtists(uniqueArtists);
                    setGenreAlbums(uniqueAlbums);
                    
                    // Cambiar el modo de vista
                    setViewMode("genre-detail");
                    
                    // Cambiar a la pestaña de categorías
                    setActiveTab("categorias");
                    
                    // Scroll hacia arriba suavemente
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsLoading(false);
                    return;
                }
            }
            
            // Caso para género individual - comportamiento original
            console.log(`Obteniendo detalles del género individual: ${genre.name}`);
            const genreDetails = await getGenreDetails(genre.slug);
            
            // Actualizar los estados con la información obtenida
            setSelectedGenre(genreDetails.genre || genre);
            setGenreArtists(genreDetails.artists || []);
            setGenreAlbums(genreDetails.albums || []);
            setGenreSongs(genreDetails.songs || []);
            
            // Cambiar el modo de vista
            setViewMode("genre-detail");
            
            // Cambiar a la pestaña de categorías para asegurar que se muestra la vista correcta
            setActiveTab("categorias");

            // Scroll hacia arriba suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error(`Error al obtener datos del género ${genre.name}:`, error);
            // En caso de error, mostrar solo la información básica del género
            setSelectedGenre(genre);
            setGenreArtists([]);
            setGenreAlbums([]);
            setGenreSongs([]);
            setViewMode("genre-detail");
            setActiveTab("categorias");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Función para eliminar duplicados de un array basado en una propiedad
    const removeDuplicates = <T extends Record<string, any>>(array: T[], key: string): T[] => {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (!value) return true; // Mantener elementos sin la propiedad especificada
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    };
    
    // Función para volver a la vista normal
    const handleBackToNormal = () => {
        setViewMode("normal");
        setSelectedArtist(null);
        setSelectedGenre(null);
    };
    
    // Listener para eventos desde el componente GenreDetail
    useEffect(() => {
        // Para seleccionar artistas desde la vista de género
        const handleSelectArtist = (event: any) => {
            const artist = event.detail;
            if (artist) {
                handleArtistSelect(artist);
            }
        };
        
        // Para reproducir canciones desde la vista de género
        const handlePlaySong = (event: any) => {
            const song = event.detail;
            if (song) {
                console.log(`Reproduciendo canción desde el género: ${song.title}`);
                // Aquí iría la lógica para reproducir la canción
                // Por ejemplo, podrías actualizar el estado del reproductor
            }
        };
        
        // Para seleccionar albums desde la vista de género
        const handleSelectAlbum = (event: any) => {
            const album = event.detail;
            if (album) {
                console.log(`Seleccionado álbum desde el género: ${album.title}`);
                // Aquí iría la lógica para mostrar detalles del álbum o reproducir sus canciones
                // Por ejemplo:
                // setCurrentAlbum(album);
                // setViewMode('album-detail');
            }
        };
        
        // Para navegar a géneros relacionados
        const handleSelectRelatedGenre = (event: any) => {
            const genreName = event.detail;
            if (genreName) {
                console.log(`Navegando a género relacionado: ${genreName}`);
                // Buscar el género relacionado en las categorías
                let foundGenre: any = null;
                
                // En una implementación completa, aquí buscaríamos el género por su nombre
                // en los datos reales de la API
                apiCategories.forEach(category => {
                    if (category.genres) {
                        const genre = category.genres.find(g => 
                            g.name.toLowerCase() === genreName.toLowerCase()
                        );
                        if (genre) {
                            foundGenre = {
                                id: genre.id,
                                name: genre.name,
                                slug: genre.slug,
                                category: category.name,
                                count: genre.count || 0
                            };
                        }
                    }
                });
                
                if (foundGenre) {
                    handleGenreSelect(foundGenre);
                } else {
                    // Si no encontramos el género, podríamos buscar uno que contenga el nombre
                    // o mostrar un mensaje de error
                    console.log(`No se encontró el género relacionado: ${genreName}`);
                }
            }
        };
        
        window.addEventListener('selectArtist', handleSelectArtist);
        window.addEventListener('playSong', handlePlaySong);
        window.addEventListener('selectAlbum', handleSelectAlbum);
        window.addEventListener('selectRelatedGenre', handleSelectRelatedGenre);
        
        return () => {
            window.removeEventListener('selectArtist', handleSelectArtist);
            window.removeEventListener('playSong', handlePlaySong);
            window.removeEventListener('selectAlbum', handleSelectAlbum);
            window.removeEventListener('selectRelatedGenre', handleSelectRelatedGenre);
        };
    }, []);

    // Simular carga de datos para otras pestañas
    useEffect(() => {
        if (activeTab !== "canciones") {
            setIsLoading(true)
            const timer = setTimeout(() => {
                setIsLoading(false)
            }, 250)

            return () => clearTimeout(timer)
        }
    }, [activeTab])

    // Función para realizar la búsqueda
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setIsSearching(false)
            return
        }

        // Si estamos en la vista de detalle del artista, volver a la vista normal
        if (viewMode === "artist-detail") {
            setViewMode("normal")
            setSelectedArtist(null)
        }

        setIsSearching(true)
        setIsLoading(true)

        const term = searchTerm.toLowerCase()

        // Simular tiempo de búsqueda
        const timer = setTimeout(() => {
            // Filtrar artistas
            const filteredArtists = staticArtists.filter((artist) => artist.name.toLowerCase().includes(term))

            // Filtrar álbumes - Ahora incluimos álbumes del API
            const staticAlbums = albums.filter(
                (album) => album.title.toLowerCase().includes(term) || album.artist.toLowerCase().includes(term),
            )
            
            // Filtrar álbumes del API
            const dynamicAlbums = apiAlbums.filter(
                (album) => album.title.toLowerCase().includes(term) || album.artist.toLowerCase().includes(term)
            )
            
            // Combinar álbumes estáticos y dinámicos
            const allAlbums = [...staticAlbums, ...dynamicAlbums]

            // Filtrar canciones desde la API
            const filteredSongs = apiSongs.filter(
                (song) =>
                    song.title.toLowerCase().includes(term) ||
                    song.artist.toLowerCase().includes(term) ||
                    (song.album && song.album.toLowerCase().includes(term)),
            )

            setSearchResults({
                artists: filteredArtists,
                albums: allAlbums,
                songs: filteredSongs,
            })

            setIsLoading(false)
        }, 250)

        return () => clearTimeout(timer)
    }, [searchTerm, apiSongs, apiAlbums])

    // Limpiar la búsqueda
    const clearSearch = () => {
        setSearchTerm("")
        setIsSearching(false)
    }

    // Componentes Skeleton
    const ArtistSkeleton = () => (
        <div className="group">
            <div className="p-3 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )

    const AlbumSkeleton = () => (
        <div className="group">
            <div className="p-3 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )

    const CategorySkeleton = () => (
        <div className="group">
            <Skeleton className="w-full aspect-square rounded-lg" />
        </div>
    )

    const SongSkeleton = () => (
        <div className="flex items-center p-3">
            <Skeleton className="h-8 w-8 rounded mr-3" />
            <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-10" />
        </div>
    )

    return (
        <div className="flex-1 flex flex-col h-full rounded-lg bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
            {/* Parte superior fija (sin scroll) */}
            <div className="p-6 pb-0 flex-shrink-0">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Busca canciones, artistas o albums"
                        className="w-full py-3 pl-10 pr-10 bg-zinc-900 rounded-full text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <X className="h-5 w-5 text-zinc-400 hover:text-white" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-6 border-b border-zinc-700 overflow-x-auto custom-scrollbar pb-1">
                        {viewMode === "artist-detail" && selectedArtist ? (
                            <div className="flex items-center">
                                <button 
                                    onClick={handleBackToNormal}
                                    className="mr-4 p-1 rounded-full hover:bg-zinc-800 transition-colors flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span className="text-sm font-medium">Volver</span>
                                </button>
                                <span className="text-sm font-medium text-white border-b-2 border-purple-500 pb-2 px-1">{selectedArtist.name}</span>
                            </div>
                        ) : viewMode === "genre-detail" && selectedGenre ? (
                            <div className="flex items-center">
                                <button 
                                    onClick={handleBackToNormal}
                                    className="mr-4 p-1 rounded-full hover:bg-zinc-800 transition-colors flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span className="text-sm font-medium">Volver</span>
                                </button>
                                <span className="text-sm font-medium text-white border-b-2 border-indigo-500 pb-2 px-1">Género: {selectedGenre.name}</span>
                            </div>
                        ) : (
                            tabs.map((tab) => (                            <button
                                key={tab.key}
                                className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? "text-white border-b-2 border-green-500" : "text-zinc-400 hover:text-white"
                                    }`}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    // Si estamos en alguna vista de detalle, volvemos a la vista normal
                                    if (viewMode !== "normal") {
                                        setViewMode("normal");
                                        setSelectedArtist(null);
                                        setSelectedGenre(null);
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Parte con scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 min-h-0">
                {/* Mensaje de error si falla la carga del API */}
                {loadingError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg text-red-300 text-sm">
                        {loadingError}
                    </div>
                )}

                {/* Mostrar resultados de búsqueda o contenido normal */}
                {/* Contenido de los detalles del artista seleccionado */}
                {viewMode === "artist-detail" && selectedArtist ? (
                    <ArtistDetail 
                        artist={selectedArtist}
                        albums={artistAlbums}
                        songs={artistSongs}
                        isLoading={isLoading}
                    />
                ) : viewMode === "genre-detail" && selectedGenre ? (
                    <GenreDetail 
                        genre={selectedGenre}
                        artists={genreArtists}
                        albums={genreAlbums}
                        songs={genreSongs}
                        isLoading={isLoading}
                        onSelectRelatedGenre={(genreName) => {
                            console.log(`Navegando a género relacionado desde prop: ${genreName}`);
                            // Buscar el género relacionado en las categorías
                            let foundGenre: any = null;
                            
                            // Buscamos el género por su nombre
                            apiCategories.forEach(category => {
                                if (category.genres) {
                                    const genre = category.genres.find(g => 
                                        g.name.toLowerCase() === genreName.toLowerCase()
                                    );
                                    if (genre) {
                                        foundGenre = {
                                            id: genre.id,
                                            name: genre.name,
                                            slug: genre.slug,
                                            category: category.name,
                                            count: genre.count || 0
                                        };
                                    }
                                }
                            });
                            
                            if (foundGenre) {
                                handleGenreSelect(foundGenre);
                            } else {
                                console.log(`No se encontró el género relacionado: ${genreName}`);
                                // Podríamos mostrar un mensaje al usuario o implementar una búsqueda parcial
                            }
                        }}
                    />
                ) : isSearching ? (
                    <div className="space-y-6">
                        {/* Resultados de artistas */}
                        {isLoading ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Artistas</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                    {[...Array(7)].map((_, index) => (
                                        <ArtistSkeleton key={index} />
                                    ))}
                                </div>
                            </div>
                        ) : searchResults.artists.length > 0 ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Artistas</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                    {searchResults.artists.map((artist) => (
                                        <div 
                                            key={artist.id} 
                                            className="group cursor-pointer"
                                            onClick={() => {
                                                // Convertir el formato de artista de búsqueda al formato ArtistType
                                                const artistData: ArtistType = {
                                                    id: artist.id.toString(),
                                                    name: artist.name,
                                                    image_url: artist.imageUrl
                                                };
                                                handleArtistSelect(artistData);
                                            }}
                                        >
                                            <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                <img
                                                    src={artist.imageUrl || "/placeholder.svg"}
                                                    alt={artist.name}
                                                    className="w-full aspect-square rounded-full object-cover mb-2"
                                                />
                                                <h3 className="font-bold text-sm text-white truncate">{artist.name}</h3>
                                                <p className="text-xs text-zinc-400 truncate">Artista</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Resultados de álbumes */}
                        {isLoading ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Álbumes</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                    {[...Array(7)].map((_, index) => (
                                        <AlbumSkeleton key={index} />
                                    ))}
                                </div>
                            </div>
                        ) : searchResults.albums.length > 0 ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Álbumes</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                    {searchResults.albums.map((album) => (
                                        <div key={album.id} className="group cursor-pointer">
                                            <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                <img
                                                    src={album.coverUrl || "/placeholder.svg"}
                                                    alt={album.title}
                                                    className="w-full aspect-square rounded-lg object-cover mb-2"
                                                />
                                                <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                                                <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Resultados de canciones - Actualizado para usar apiSongs */}
                        {isLoading ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Canciones</h2>
                                <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                                    {[...Array(5)].map((_, index) => (
                                        <SongSkeleton key={index} />
                                    ))}
                                </div>
                            </div>
                        ) : searchResults.songs.length > 0 ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Canciones</h2>
                                <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                                    {searchResults.songs.map((song, index) => (
                                        <div
                                            key={song._id}
                                            className={`flex items-center p-3 hover:bg-zinc-800 ${index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-900/30"}`}
                                        >
                                            <img
                                                src={song.cover_url || "/placeholder.svg"}
                                                alt={song.title}
                                                className="h-8 w-8 rounded object-cover mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-white truncate">{song.title}</h3>
                                                <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                                            </div>
                                            <div className="text-xs text-zinc-400">{song.duration}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* No hay resultados */}
                        {!isLoading &&
                            searchResults.artists.length === 0 &&
                            searchResults.albums.length === 0 &&
                            searchResults.songs.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-zinc-400">No se encontraron resultados para "{searchTerm}"</p>
                                </div>
                            )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {activeTab === "artistas" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Artistas populares</h2>
                                    <button className="text-sm text-zinc-400 hover:text-white">Ver todo</button>
                                </div>
                                {isLoading ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {[...Array(14)].map((_, index) => (
                                            <ArtistSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {/* Mostrar artistas de la API usando la nueva interfaz ArtistType */}
                                        {apiArtists.length > 0 ? (
                                            apiArtists.map((artist) => (
                                                <div key={artist.id} className="group cursor-pointer" onClick={() => handleArtistSelect(artist)}>
                                                    <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                        <img
                                                            src={artist.image_url || "/placeholder.svg"}
                                                            alt={artist.name}
                                                            className="w-full aspect-square rounded-full object-cover mb-2"
                                                        />
                                                        <h3 className="font-bold text-sm text-white truncate">{artist.name}</h3>
                                                        <p className="text-xs text-zinc-400 truncate">
                                                            {artist.genres && artist.genres.length > 0 ? artist.genres[0] : "Artista"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            staticArtists.map((artist) => (
                                                <div 
                                                    key={artist.id} 
                                                    className="group cursor-pointer"
                                                    onClick={() => {
                                                        // Convertir el formato de artista estático al formato ArtistType
                                                        const artistData: ArtistType = {
                                                            id: artist.id.toString(),
                                                            name: artist.name,
                                                            image_url: artist.imageUrl
                                                        };
                                                        handleArtistSelect(artistData);
                                                    }}
                                                >
                                                    <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                        <img
                                                            src={artist.imageUrl || "/placeholder.svg"}
                                                            alt={artist.name}
                                                            className="w-full aspect-square rounded-full object-cover mb-2"
                                                        />
                                                        <h3 className="font-bold text-sm text-white truncate">{artist.name}</h3>
                                                        <p className="text-xs text-zinc-400 truncate">Artista</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        
                                        {/* Mensaje cuando no hay artistas */}
                                        {apiArtists.length === 0 && staticArtists.length === 0 && (
                                            <div className="col-span-full text-center py-10">
                                                <p className="text-zinc-400">No hay artistas disponibles</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "albums" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Álbumes destacados</h2>
                                    <button className="text-sm text-zinc-400 hover:text-white">Ver todo</button>
                                </div>
                                {isLoading ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {[...Array(14)].map((_, index) => (
                                            <AlbumSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {/* Mostrar álbumes de la API si hay disponibles, si no, mostrar estáticos */}
                                        {apiAlbums.length > 0 ? (
                                            apiAlbums.map((album) => (
                                                <div key={album.id} className="group cursor-pointer">
                                                    <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                        <img
                                                            src={album.coverUrl || "/placeholder.svg"}
                                                            alt={album.title}
                                                            className="w-full aspect-square rounded-lg object-cover mb-2"
                                                        />
                                                        <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                                                        <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            albums.map((album) => (
                                                <div key={album.id} className="group cursor-pointer">
                                                    <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                                                        <img
                                                            src={album.coverUrl || "/placeholder.svg"}
                                                            alt={album.title}
                                                            className="w-full aspect-square rounded-lg object-cover mb-2"
                                                        />
                                                        <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                                                        <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        
                                        {/* Mensaje cuando no hay álbumes */}
                                        {apiAlbums.length === 0 && albums.length === 0 && (
                                            <div className="col-span-full text-center py-10">
                                                <p className="text-zinc-400">No hay álbumes disponibles</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "categorias" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Explora por categorías</h2>
                                    <button className="text-sm text-zinc-400 hover:text-white">Ver todo</button>
                                </div>
                                {isLoading ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {[...Array(14)].map((_, index) => (
                                            <CategorySkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {/* Mostrar categorías de la API si hay disponibles, de lo contrario usar las estáticas */}
                                        {apiCategories.length > 0 ? (
                                            apiCategories.map((category) => (
                                                <div 
                                                    key={category.id} 
                                                    className="group cursor-pointer"
                                                    onClick={async () => {
                                                        if (category.genres && category.genres.length > 0) {
                                                            // Seleccionar el primer género de la categoría
                                                            // para mostrar todas las canciones de esta categoría
                                                            const firstGenre = category.genres[0];
                                                            const genreInfo = {
                                                                id: firstGenre.id,
                                                                name: category.name, // Usar el nombre de la categoría
                                                                slug: firstGenre.slug,
                                                                category: "Categoría",
                                                                count: firstGenre.count || 0
                                                            };
                                                            handleGenreSelect(genreInfo);
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className={`relative overflow-hidden rounded-lg aspect-square bg-gradient-to-br ${category.color || 'from-purple-500 to-blue-500'} p-3 flex flex-col`}
                                                    >
                                                        <h3 className="font-bold text-white text-sm z-10 mb-1">{category.name}</h3>
                                                        
                                                        {/* Mostrar algunos géneros si están disponibles */}
                                                        {category.genres && category.genres.length > 0 && (
                                                            <div className="mt-auto z-10">
                                                                <p className="text-xs text-white/70 mb-1">
                                                                     ({category.genres.length} {category.genres.length === 1 ? 'género' : 'géneros'})
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {category.genres.slice(0, 2).map((genre) => (
                                                                        <span 
                                                                            key={genre.id} 
                                                                            className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-sm hover:bg-white/30 cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleGenreSelect({
                                                                                    id: genre.id,
                                                                                    name: genre.name,
                                                                                    slug: genre.slug,
                                                                                    category: category.name,
                                                                                    count: genre.count
                                                                                });
                                                                            }}
                                                                        >
                                                                            {genre.name}
                                                                        </span>
                                                                    ))}
                                                                    {category.genres.length > 2 && (
                                                                        <span 
                                                                            className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-sm hover:bg-white/30"
                                                                        >
                                                                            +{category.genres.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {category.image_url && (
                                                            <img 
                                                                src={category.image_url} 
                                                                alt={category.name}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                                                            />
                                                        )}
                                                        <div className="absolute inset-0 opacity-20 bg-pattern-dots"></div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            categories.map((category) => (
                                                <div key={category.id} className="group cursor-pointer">
                                                    <div
                                                        className={`relative overflow-hidden rounded-lg aspect-square bg-gradient-to-br ${category.color} p-3 flex items-end`}
                                                    >
                                                        <h3 className="font-bold text-white text-sm z-10">{category.name}</h3>
                                                        <div className="absolute inset-0 opacity-20 bg-pattern-dots"></div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Nueva pestaña para mostrar todas las canciones desde el microservicio */}
                        {activeTab === "canciones" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Todas las canciones</h2>
                                </div>
                                {isLoading ? (
                                    <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                                        {[...Array(10)].map((_, index) => (
                                            <SongSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                                        {apiSongs.length > 0 ? (
                                            apiSongs.map((song, index) => (
                                                <div
                                                    key={song._id}
                                                    className={`flex items-center p-3 hover:bg-zinc-800 ${index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-900/30"}`}
                                                >
                                                    <img
                                                        src={song.cover_url || "/placeholder.svg"}
                                                        alt={song.title}
                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-white truncate">{song.title}</h3>
                                                        <div className="flex items-center">
                                                            <p className="text-xs text-zinc-400 truncate">
                                                                {song.artist} • {song.album}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-xs text-zinc-400">{song.duration}</div>
                                                        <div className="text-xs text-zinc-500">
                                                            {new Intl.NumberFormat().format(song.plays)} reproducciones
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-zinc-400">No hay canciones disponibles</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Información detallada de canciones */}
                                {apiSongs.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-bold mb-4">Información detallada</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {apiSongs.slice(0, 4).map((song) => (
                                                <div key={song._id} className="bg-zinc-800/50 p-4 rounded-lg">
                                                    <div className="flex">
                                                        <img
                                                            src={song.cover_url || "/placeholder.svg"}
                                                            alt={song.title}
                                                            className="h-24 w-24 rounded object-cover"
                                                        />
                                                        <div className="ml-4">
                                                            <h3 className="font-bold text-white">{song.title}</h3>
                                                            <p className="text-sm text-zinc-300">{song.artist}</p>
                                                            <p className="text-sm text-zinc-400">Álbum: {song.album}</p>
                                                            <p className="text-sm text-zinc-400">Género: {song.genre}</p>
                                                            <p className="text-sm text-zinc-400">
                                                                Lanzamiento: {new Date(song.release_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-sm">
                                                        <p className="text-zinc-300">
                                                            <span className="font-semibold">Autores:</span>{" "}
                                                            {song.authors.join(", ")}
                                                        </p>
                                                        <div className="flex justify-between mt-1">
                                                            <p className="text-zinc-400">
                                                                <span className="font-semibold">👍</span> {new Intl.NumberFormat().format(song.likes)}
                                                            </p>
                                                            <p className="text-zinc-400">
                                                                <span className="font-semibold">▶️</span> {new Intl.NumberFormat().format(song.plays)} reproducciones
                                                            </p>
                                                            <p className="text-zinc-400">
                                                                <span className="font-semibold">⏱️</span> {song.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        
            {/* Modal para mostrar todos los géneros de una categoría */}
            {selectedCategory && (
                <GenresModal 
                    isOpen={isGenresModalOpen}
                    onClose={() => setIsGenresModalOpen(false)}
                    category={selectedCategory}
                    onGenreSelect={handleGenreSelect}
                />
            )}
        </div>
    )
}