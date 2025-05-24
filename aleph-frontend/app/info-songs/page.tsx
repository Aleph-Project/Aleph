import { Sidebar } from "@/components/music-player/sidebar"
import { MusicPlayer } from "@/components/music-player/music-player"
import '@/app/globals.css'
import { CirclePlus } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function InfoSongsPage() {
    const songInfo = {
    title: "El CLúB",
    description: `La canción "EL CLúB" de Bad Bunny es una introspección melancólica que se desarrolla en el 
    contexto de una noche de fiesta. A primera vista, la letra describe una escena típica de un club nocturno, 
    con música, mujeres y sustancias recreativas. Sin embargo, a medida que avanza, se revela un trasfondo emocional más 
    profundo, donde el protagonista, a pesar de estar rodeado de gente y diversión, se siente vacío y perdido.`,
    genres: ["Reguetón", "Trap", "Latino", "Urbano", "Pop"],
    duration: "3:42 minutos - 2025",
    likes: "249.081.633 Me gusta",
    views: "400.020.280 Reproducciones",
    lyrics: `Yeah, 2:00 de la mañana en el club
To'l mundo pasándola cabrón
Las mujeres encima de mí
La hookah, las pastillas y un blunt
La que yo quiera dice que sí
Bien loco cantando la canción
Después de aquí nos vamos pa-
¿Qué estará haciendo mi ex
Que hace tiempo por ahí no se ve?
¿Será que ya me superó y le va bien?
Mientras que yo, borracho, pienso
¿Qué estará haciendo mi ex
Que hace tiempo por ahí no se ve?
¿Será que ya me superó y le va bien?
Mientras que yo, borracho, pienso
¿Qué diablo estará haciendo?
¿Estará jangueando o estará durmiendo?
¿Estará fumando o estará bebiendo?
¿Seguirá sola o está saliendo
Con otro que no soy yo?, no soy yo
Mami, ese no soy yo, no soy yo
Aposté que te olvidaba y perdí 500
Otra vez me ganaron los sentimiento'
Los muchachos piensan que yo estoy contento
Pero no, estoy muerto por dentro
La disco está llena y a la vez vacía
Porque no está la nena mía
Con la que yo siempre me reía
Con la que yo siempre me venía
Con la que yo hablaba to' los días
Y ahora no sé na, y ahora no sé na, ey
¿Qué estará haciendo mi ex
Que hace tiempo por ahí no se ve?
¿Será que ya me superó y le va bien?
Mientras que yo, borracho, pienso
2019, un pestañeo y ahora estamo aquí
2020, la última vez que yo fui feliz
2022, la última vez que yo te vi
La vida no me cumplió na de lo que le pedí
No sé qué pasó, yo le pedí a Dios
Pero él también me ghosteó
El futuro me golpeó, en el pasado me dejó
La felicidad se alejó
Y me pregunto qué estarás haciendo
Si en mí estás pensando
O si la luna estás viendo
Con otra persona conectando
Y si de mí le estás hablando, eh-eh
Espero aunque sea ser un buen recuerdo
Ser un buen recuerdo
Fuente: Musixmatch
Compositores: Marco Daniel Borrero / Benito Antonio Martinez Ocasio / álvaro Jerez Barranco / Scott H Dittrich / Martin Hardie Coogan / Benjamin Falik / Yuval Haim Chain / Roberto Jose Jr Rosado Torres / Aidan James Cullen / Willkar Jose Soto Figueroa
Letra de EL CLúB © Universal Music Corp., Straight From The Art Music, Songs Of Universal Inc., Cody Pablito Publishing, Howl Of The Moon Music, Six Ten Worldwide Publishing, Grass Is Greener Publishing, Howard Hues Music, Rsm Publishing Llc, Creative Park Publishing`,
    images: [
    "/Bad Bunny (1).jfif",
    ],
  };
  return (
    <div className="flex flex-col h-screen bg-black text-white pt-16 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden text-white ">
                    {/*contenedor de toda la información con su titulo */}
                    <div className="relative flex-1 overflow-auto bg-gray-700/45 rounded-xl m-4 overflow-scroll hide-scrollbar">
                        <div className="grid grid-cols-[1fr_2fr] gap-4 m-9">
                            <div className="flex place-items-end">
                                <h1 className="text-left text-7xl font-extrabold ">{songInfo.title}</h1>
                            </div>
                            <div className="flex place-items-end col-span-1 ">
                                <Button className="flex items-center space-x-2 text-mauve bg-none py-2 px-4 rounded-xl">
                                    <CirclePlus className="w-[10vw] h-[10vw] max-w-[3rem] max-h-[3rem] min-w-[2rem] min-h-[2rem]" />
                                </Button>
                                
                            </div>
                        </div>
                        <div className="m-9">
                            <p className="text-justify w-[60%] ">{songInfo.description}</p>
                        </div>
                    

                        {/*contenedor unicamente de la información*/}
                        <div className="bg-white p-4 rounded-3xl shadow-lg w-full h-full overflow-scroll hide-scrollbar">
                            <div className="grid grid-cols-2 gap-4 m-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-black mb-6">Artista</h1>
                                    {/* Carrusel de imágenes de artistas */}
                                    <div className="flex items-center space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 py-2">
                                        {songInfo.images.map((src, index) => (
                                            <div key={index} className="flex flex-col items-center min-w-[12rem]">
                                                <img 
                                                    src={src} 
                                                    alt={`Bad Bunny ${index + 1}`} 
                                                    className="w-48 h-48 object-cover rounded-full mb-3"
                                                />
                                                <p className="text-electricViolet font-bold text-2xl mb-6">
                                                    Bad Bunny
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <h1 className="text-2xl font-bold text-black mb-6">Información</h1>
                                    {/* acá van los genéros*/}
                                    <div>
                                        {songInfo.genres.map((genre, index) => (
                                        <button 
                                         key={index}
                                         className="m-3 bg-purple-200 text-electricViolet font-bold py-2 px-4 rounded transition-colors duration-200 rounded-xl">
                                            {genre}
                                        </button>
                                        ))}
                                    </div>
                                    <div className="text-black mb-6 text-justify">
                                        <h1 className="text-2xl font-bold text-black mt-6">Duración</h1>
                                        <p className="mb-6"> {songInfo.duration}</p>
                                        <h1 className="text-2xl font-bold text-black ">Likes</h1>
                                        <p className="mb-6"> {songInfo.likes} </p>
                                        <h1 className="text-2xl font-bold text-black">Reproducciones</h1>
                                        <p className="mb-6"> {songInfo.views} </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h1 className="text-2xl font-bold text-black mb-6">Letra</h1>
                                    <p className="text-black">{songInfo.lyrics}</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MusicPlayer />
    </div>
  );
}