"use client";

import { Search, X, ArrowLeft, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Review } from "@/components/reviews-profile/review";
import { useMemo } from "react";


interface userData {
  name: string;
  bio: string;
  birthday: string;
  city_id: string;
  avatar_url: string | null;
  background_url: string | null;
}

// Interfaz para los datos de cada reseña 
interface ReviewData {
    id: string;
    reviewed_object_id: string;
    auth_id: string;
    review_title: string;
    review_body: string;
    rating: number;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    is_song: boolean;
    reviewed_object_name: string;
  }

  // Interfaz para las props del componente ReviewsList
  interface ReviewsListProps {
    userReviews: ReviewData[];
  }

  interface MainContentProps {
    onEditClick: () => void;
    onDeleteClick: () => void;
    userData: userData;
    userReviews: ReviewData[];
    onDeleteReview: (reviewdId: string) => void;
  }

export function MainContent({ onEditClick, onDeleteClick, userData, userReviews, onDeleteReview}: MainContentProps, ) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const reviewsProcesadas = useMemo(() => {
    return userReviews.map((review: ReviewData) => ({
      ...review,
      reviewDateCreation: new Date(review.created_at).toLocaleDateString(),
      reviewDateUpdate: new Date(review.updated_at).toLocaleDateString(),
    }))
  }, [userReviews]);
  const [isLoading, setIsLoading] = useState(true);
  // const [urlImg, setUrlImg] = useState("/cat.jpg");
  // const [urlWallpaper, setUrlWallpaper] = useState("/wallpaper.jpg");
  // const [nom_profile, setNom_profile] = useState("Catalina_Gmz");
  // const [bio, setBio] = useState(
  //   "Soy una amante de la música y la cultura. Me encanta descubrir nuevos artistas y compartir mis descubrimientos con los demás. Siempre estoy buscando nuevas melodías que me inspiren y me hagan sentir viva."
  // );
  
  // const sampleReviews = [
  //   {
  //     authId: "auth123",
  //     reviewId: "review1",
  //     reviewTitle: "Gran experiencia con esta canción",
  //     reviewBody:
  //       "Una de las mejores canciones que he escuchado, excelente producción y letras profundas.",
  //     reviewRating: 5,
  //     reviewDateCreation: "2024-05-15T18:25:43.511Z",
  //     reviewDateUpdate: "2024-05-15T18:25:43.511Z",
  //     isPublic: true,
  //     username: "MariaMusic22",
  //     profileImage: "/cat.jpg",
  //     reviewedObjectId: "song123",
  //     isSong: true,
  //     reviewedObjectName: "Oh Melancholy Hill",
  //   },
  //   {
  //     authId: "auth456",
  //     reviewId: "review2",
  //     reviewTitle: "Buen álbum pero esperaba más",
  //     reviewBody:
  //       "El álbum tiene buenos momentos pero le falta consistencia. Las primeras canciones son excelentes pero decae al final.",
  //     reviewRating: 3,
  //     reviewDateCreation: "2024-05-10T14:30:22.000Z",
  //     reviewDateUpdate: "2024-05-11T09:15:10.000Z",
  //     isPublic: false,
  //     username: "JuanRock",
  //     profileImage: "",
  //     reviewedObjectId: "album456",
  //     isSong: false,
  //     reviewedObjectName: "Lust For Life",
  //   },
  //   {
  //     authId: "auth789",
  //     reviewId: "review3",
  //     reviewTitle: "Artista revelación del año",
  //     reviewBody:
  //       "Este artista demuestra un talento increíble, su evolución musical es impresionante y su último trabajo es una obra maestra.",
  //     reviewRating: 5,
  //     reviewDateCreation: "2024-05-01T10:12:33.000Z",
  //     reviewDateUpdate: "2024-05-01T10:12:33.000Z",
  //     isPublic: true,
  //     username: "CarlosJazz",
  //     profileImage: "",
  //     reviewedObjectId: "song789",
  //     isSong: true,
  //     reviewedObjectName: "The Sound of Silence",
  //   },
  // ];
  // const [reviews, setReviews] = useState(sampleReviews);

  

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex-1 flex flex-col h-full rounded-lg bg-gradient-to-b from-zinc-800 to-black overflow-y-auto">
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
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <X className="h-5 w-5 text-zinc-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Contenedor principal con posición relativa para los elementos superpuestos */}
        <div className="relative w-full">
          {/* Contenedor fondo de perfil (z-10 para estar atrás) */}
          <div className="rounded-lg shadow-md p-0 absolute top-0 left-0 w-full h-80 z-10 border-4 border-white/10">
            <img
              className="w-full h-full object-cover opacity-50"
              src={userData.background_url || "/wallpaper.png"}
              alt="Wallpaper"
            ></img>
          </div>

          <div className="rounded-lg p-6 pb-0 pt-40 relative flex z-20">
            {/* Contenedor icono y nombre */}
            <div className="relative flex flex-col w-full">
              {/* Contenedor imagen perfil */}
              <div className="flex items-center p-6 ml-6">
                <img
                  className="w-48 h-48 rounded-full object-cover mb-4 md:mb-0 md:mr-6 border-4 border-white/10 shadow-xl"
                  src={userData.avatar_url || "/userimg.png"}
                  alt="Perfil"
                />
                {/* Contenedor nombre */}
                <div className="flex items-center ml-6">
                  <h2 className="text-white text-[60px] font-bold">
                    {userData.name || ""}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor datos */}

        <div className="bg-white rounded-lg shadow-md p-6 pl-16 h-[100%] -mt-20 relative z-15">
          <div className="grid grid-cols-3 grid-rows-[auto_minmax(200px,auto)_auto] gap-4 relative">
            {/* Parte 6 */}
            <div className="col-span-2">6</div>

            {/* Parte 7 */}
            <div className="col-start-3 relative">
              <div className="flex justify-end items-center">
                <div className="relative z-40">
                  <button
                    onClick={() => {
                      console.log("Botón dentro de MainContent clickeado");
                      onEditClick();
                    }}
                    className="text-sm px-5 py-2 rounded-full transition-colors border font-medium border-[#9610FB] bg-[#9610FB] text-white hover:bg-[#b05cff] hover:border-[#b05cff]"
                  >
                    Editar
                  </button>
                    <button
                    onClick={() => {
                      onDeleteClick();
                    }}
                    className="text-sm px-5 py-2 rounded-full transition-colors border font-medium border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700"
                    >
                    Eliminar
                    </button>
                </div>
              </div>
            </div>

            {/* Parte 8 */}
            <div className="col-span-2 row-start-2  p-4 pl-0 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-federalBlue font-bold text-2xl">Bio</h3>
                </div>
                <div>
                  <p className="text-richBlack">{userData.bio || ""}</p>
                </div>
              </div>
            </div>

            {/* Parte 9 */}
            <div className="col-span-2 col-start-1 row-start-3  p-4 pl-0 h-full">
              <div className="flex flex-col h-full ">
                <div className="mb-4">
                  <h3 className="text-federalBlue font-bold text-2xl">
                    Mis comentarios y reseñas
                  </h3>
                </div>
                <div>
                  <div className="flex flex-col gap-4">
                    {/* Aquí puedes mapear tus reseñas */}

                    {reviewsProcesadas.length === 0 ? (
                      <div className="flex items-center h-full">
                        <p className="text-black">No tienes reseñas aún</p>
                      </div>
                    ) : (
                    reviewsProcesadas.map((review: ReviewData) => (
                      <Review
                        key={review.id}
                        authId={review.auth_id}
                        reviewId={review.id}
                        reviewTitle={review.review_title}
                        reviewBody={review.review_body}
                        reviewRating={review.rating}
                        reviewDateCreation={review.created_at}
                        reviewDateUpdate={review.updated_at}
                        isPublic={review.is_public}
                        username={userData.name}
                        profileImage={userData.avatar_url || "/userimg.png"}
                        reviewedObjectId={review.reviewed_object_id}
                        isSong={review.is_song}
                        reviewedObjectName={review.reviewed_object_name}
                        onDeleteReview={onDeleteReview}
                      />
                    )))}
                  </div>
                </div>
              </div>
            </div>

            {/* Parte 10 */}
            <div className="row-span-2 col-start-3 row-start-2">10</div>
          </div>
        </div>
      </div>
    </div>
  );
}
