"use client";

import { useState, useEffect } from "react";
import { MusicPlayer } from "@/components/music-player/music-player";
import { Sidebar } from "@/components/music-player/sidebar";
import { MainContent } from "@/components/profile-page/main-content";
import { EditProfile } from "@/components/profile-page/edit-profile";
import { useUser } from "@auth0/nextjs-auth0";
import {
  checkProfileExists,
  getProfileLogued,
} from "@/services/profileService";
import { getAllReviewsByProfile } from "@/services/reviewService";
import { getAlbumById, getSongById } from "@/services/songService";
import { extractAuthIdFromUser } from "../utils/auth";
import Link from "next/link";
import { DeleteProfile } from "@/services/profileService";

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
}

interface Review {
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
  // Note: missing created_at and updated_at according to the error
}

export default function Profile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const { user, isLoading } = useUser();
  const auth_id = extractAuthIdFromUser(user?.sub);
  const [userData, setUserData] = useState({
    name: "",
    bio: "",
    birthday: "",
    city_id: "",
    avatar_url: null,
    background_url: null,
  });
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const getProfileData = async (auth_id: string) => {
    try {
      const res = await getProfileLogued(auth_id);

      // console.log("Perfil logueado:", res);
      setUserData({
        name: res.profile.name,
        bio: res.profile.bio,
        birthday: res.profile.birthday,
        city_id: res.profile.city_id,
        avatar_url: res.avatar_url,
        background_url: res.background_url,
      });
      return res;
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  };

  const getUserReviews = async (auth_id: string): Promise<Review[]> => {
    try {
      const res = await getAllReviewsByProfile(auth_id);
      // console.log("Reseñas obtenidas:", res);

      setUserReviews(res);
      return res;
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
  };

  const getSongsorAlbumsOfReviews = async (userReviews: Review[]) => {
    try {
      const completeReviews = await Promise.all(
        userReviews.map(async (review: Review) => {
          const { reviewed_object_id, is_song } = review;
          let songOrAlbumData = null;

          if (is_song) {
            songOrAlbumData = await getSongById(reviewed_object_id);
          } else {
            songOrAlbumData = await getAlbumById(reviewed_object_id);
          }

          return {
            ...review,
            reviewed_object_name: songOrAlbumData?.title || "Desconocido",
          };
        })
      );
      setUserReviews(completeReviews);
    } catch (error) {
      console.error("Error fetching songs or albums of reviews:", error);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    setUserReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  useEffect(() => {
    if (auth_id) {
      // console.log("Verificando existencia de perfil para:", auth_id);
      checkProfileExists(auth_id)
        .then(async (response) => {
          setProfileExists(response.exists);
          // console.log("Perfil existe:", response.exists);
          await getProfileData(auth_id);
          const reviews = await getUserReviews(auth_id);
          if (reviews) {
            await getSongsorAlbumsOfReviews(reviews);
          }
        })
        .catch((error) => {
          console.error("Error checking profile existence:", error);
          setProfileExists(false);
        });
    }
  }, [user]);

  // useEffect(() => {
  //   console.log("Perfil:", userData);
  // }, [userData]);

  const handleEditClick = () => {
    console.log("Botón de editar clickeado");
    setIsEditingProfile(true);
  };

  const handleBackClick = () => {
    console.log("Botón de volver clickeado");
    setIsEditingProfile(false);
  };

  const handleDeleteClick = () => {
    if (auth_id) {
      DeleteProfile(auth_id)
        .then((res) => {
          console.log("Perfil eliminado:", res);
          setProfileExists(false);
        })
        .catch((error) => {
          console.error("Error eliminando perfil:", error);
        });
    }
    
  };

  if (
    isLoading ||
    profileExists === null ||
    userData === null ||
    userReviews === null
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  // useEffect(() => {
  //   if (profileExists === true) {
  //     if (auth_id) {
  //       getAllReviewsByProfile(auth_id)
  //         .then((res) => {
  //           console.log("Reseñas obtenidas:", res);
  //           setUserReviews(res);
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching user reviews:", error);
  //         });
  //     }
  //   }
  // }, [profileExists, auth_id]);

  return (
    <div className="flex flex-col h-screen bg-black text-white pt-16 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {profileExists === false ? (
          <div className="flex items-center justify-center w-full h-full flex-col gap-4">
            <h1 className="text-2xl font-bold">No tienes un perfil creado</h1>
            <Link href="/profile/create">
              <button className="text-white px-4 py-2 rounded border-[#9610FB] bg-[#9610FB] text-white hover:bg-[#b05cff] hover:border-[#b05cff] text-sm px-5 py-2 rounded-full transition-colors border font-medium">
                Crear perfil
              </button>
            </Link>
          </div>
        ) : (
          <MainContent
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            userData={userData}
            userReviews={userReviews}
            onDeleteReview={handleDeleteReview}
          />
        )}
        {/* Modal de edición de perfil */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-zinc-800  text-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-bold">Editar Perfil</h2>
                <button
                  onClick={handleBackClick}
                  className="text-white hover:text-mauve"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4 h-full">
                <EditProfile onBackClick={handleBackClick} />
              </div>
            </div>
          </div>
        )}
      </div>
      <MusicPlayer />
    </div>
  );
}
