"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, Heart, Share2, MessageSquare, Star, Send, X, MessageCircle } from "lucide-react"
import { getSongById } from "@/services/songService"
import { getReplicasByReview } from "@/services/reviewService"
import { useParams } from "next/navigation"
import { getReviewsAndProfileBySong } from "@/services/songService"
import { ReviewWithProfile } from "@/services/songService"
import { createReplica } from "@/services/reviewService"
import { useUser } from "@auth0/nextjs-auth0";
import { extractAuthIdFromUser } from "@/app/utils/auth";

type Song = {
  _id: string;
  title: string;
  artist: string;
  authors: string[];
  album: string;
  release_date: string;
  duration: string;
  genre: string;
  likes: number;
  plays: number;
  cover_url: string;
  audio_url: string;
  spotify_id?: string;  // ID del álbum en Spotify (opcional)
  album_id?: string;    // ID del álbum (opcional)
  created_at?: string;
  updated_at?: string;
}

type Replica = {
  id: string
  review_id: string
  auth_id: string
  replica_body: string
  created_at: string
  updated_at: string
}

export default function SongPage() {
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [newReview, setNewReview] = useState({ rating: 0, text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams<{ id: string }>()
  const { id } = params
  const { user, isLoading } = useUser();
  const auth_id = extractAuthIdFromUser(user?.sub);

  // Agregado modal para las replicas de las reseñas
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null)
  const [reviewComments, setReviewComments] = useState<Replica[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await getSongById(id)
        setSong(response)

        // obtener reseñas de la canción
        const reviewsResponse = await getReviewsAndProfileBySong(id)
        setReviews(reviewsResponse.reviewsWithProfiles || [])
      } catch (error) {
        console.error("Error fetching song:", error)
      }
      finally {
        setLoading(false)
      }
    }
    fetchSong();
  }, [id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isModalOpen])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }))
  }

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, text: e.target.value }))
  }

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"
          } ${interactive ? "cursor-pointer" : ""}`}
        onClick={interactive ? () => handleRatingChange(index + 1) : undefined}
      />
    ))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.text.trim()) {
      alert("Por favor, añade una calificación y un comentario");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review: {  
            auth_id: auth_id,
            review_title: `Reseña para ${song?.title}`,
            review_body: newReview.text,
            rating: newReview.rating,
            reviewed_object_id: params.id,  // Agrega el ID de la canción
            is_song: true,  
            is_public: true  
          }
        }),
      });

      if (response.ok) {
        const newReviewData = await response.json();

        // Crear un objeto ReviewWithProfile para agregar a la lista
        const reviewWithProfile = {
          review: newReviewData,
          profile: {
            name: user?.name || "Usuario",
            avatar_url: user?.picture || "/placeholder.svg",
          }
        };

        setReviews((prev) => [reviewWithProfile, ...prev]);
        setNewReview({ rating: 0, text: "" });
      } else {
        const errorData = await response.json();
        console.error("Error en la respuesta:", errorData);
        alert("No se pudo crear la reseña. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al enviar reseña:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = async (review: ReviewWithProfile) => {
    setSelectedReview(review)
    setIsModalOpen(true)

    try {
      // Obtener comentarios de la reseña
      const data = await getReplicasByReview(review.review.id)
      setReviewComments(data)
    } catch (error) {
      console.error("Error al cargar comentarios:", error)
      setReviewComments([])
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
    setReviewComments([])
    setNewComment("")
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value)
  }

  // Enviar nuevo comentario
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedReview) {
      return
    }
    if (!auth_id) {
      alert("Debes iniciar sesión para comentar.")
      return
    }

    setIsSubmittingComment(true)
    try {

      const replica = {
        review_id: selectedReview.review.id,
        auth_id: auth_id,
        replica_body: newComment
      }

      const response = await createReplica(replica)
      if (response) {
        setReviewComments((prev) => [...prev, response])
        setNewComment("")
      } else {
        console.error("Error al crear la réplica")
      }

    } catch (error) {
      console.error("Error al enviar comentario:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Canción no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sección de cabecera con imagen difuminada */}
      <div className="relative">
        {/* Imagen de fondo difuminada */}
        <div className="absolute inset-0 overflow-hidden h-96">
          <div className="relative w-full h-full">
            <Image src={song.cover_url || "/placeholder.svg"} alt={song.album} fill className="object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-xl"></div>
          </div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Portada del álbum */}
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 shadow-2xl">
              <Image
                src={song.cover_url || "/placeholder.svg"}
                alt={song.album}
                width={256}
                height={256}
                className="object-cover"
              />
            </div>

            {/* Información de la canción */}
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-500 mb-1">Canción</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{song.title}</h1>
              <div className="flex items-center text-zinc-300 mb-4">
                <span className="font-medium">{song.artist}</span>
                <span className="mx-2">•</span>
                <span>{song.album}</span>
                <span className="mx-2">•</span>
                <span>{new Date(song.release_date).getFullYear()}</span>
                <span className="mx-2">•</span>
                <span>{song.duration}</span>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center gap-4 text-zinc-400 text-sm mb-6">
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  <span>{formatNumber(song.plays)} reproducciones</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{formatNumber(song.likes)} me gusta</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Reproducir
                </button>
                <button className="bg-transparent hover:bg-zinc-800 text-white border border-zinc-700 rounded-full px-6 py-2 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Me gusta
                </button>
                <button className="bg-transparent hover:bg-zinc-800 text-white border border-zinc-700 rounded-full px-6 py-2 flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de detalles y reseñas */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de detalles */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Detalles</h2>
            <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Artista</h3>
                <p className="font-medium">{song.artist}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Álbum</h3>
                <p className="font-medium">{song.album}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Fecha de lanzamiento</h3>
                <p className="font-medium">
                  {new Date(song.release_date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Género</h3>
                <p className="font-medium">{song.genre}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Autores</h3>
                <p className="font-medium">{song.authors.join(", ")}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-400 mb-1">Duración</h3>
                <p className="font-medium">{song.duration}</p>
              </div>
            </div>
          </div>

          {/* Columna de reseñas */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reseñas</h2>
              <div className="flex items-center text-zinc-400">
                <MessageSquare className="h-5 w-5 mr-2" />
                <span>{reviews ? reviews.length : 0} reseñas</span>
              </div>
            </div>

            {/* Formulario para nueva reseña */}
            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Escribe tu reseña</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm text-zinc-400 mb-2">Calificación</label>
                  <div className="flex gap-1">{renderStars(newReview.rating, true)}</div>
                </div>
                <div className="mb-4">
                  <label htmlFor="review-text" className="block text-sm text-zinc-400 mb-2">
                    Comentario
                  </label>
                  <textarea
                    id="review-text"
                    value={newReview.text}
                    onChange={handleReviewTextChange}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Comparte tu opinión sobre esta canción..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 flex items-center disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publicar reseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de reseñas */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.review.id}
                    className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => openReviewModal(review)}
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={review.profile.avatar_url || "/placeholder.svg"}
                        alt={review.profile.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{review.profile.name}</h4>
                          <span className="text-sm text-zinc-400">
                            {new Date(review.review.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex mb-3">{renderStars(review.review.rating)}</div>
                        <h5 className="text-sm text-zinc-400 mb-1">{review.review.review_title}</h5>
                        <p className="text-zinc-300">{review.review.review_body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-lg p-8 text-center">
                <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay reseñas todavía</h3>
                <p className="text-zinc-400">Sé el primero en compartir tu opinión sobre esta canción</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de reseña */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div
            ref={modalRef}
            className="bg-zinc-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold">Detalles de la reseña</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Información de la reseña */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <Image
                    src={selectedReview.profile.avatar_url || "/placeholder.svg"}
                    alt={selectedReview.profile.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-lg">{selectedReview.profile.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span>{formatDate(selectedReview.review.created_at)}</span>
                      <span>•</span>
                      <div className="flex">{renderStars(selectedReview.review.rating)}</div>
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 text-lg">{selectedReview.review.review_body}</p>
              </div>

              {/* Sección de comentarios */}
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comentarios ({reviewComments.length})
                </h4>

                {/* Lista de comentarios */}
                {reviewComments.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {reviewComments.map((comment) => (
                      <div key={comment.id} className="bg-zinc-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {/* <Image
                            src={comment.user.avatar || "/placeholder.svg"}
                            alt={comment.user.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          /> */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">Nombre del usuario</h5>
                              <span className="text-xs text-zinc-400">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="text-zinc-300">{comment.replica_body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-lg p-4 text-center mb-6">
                    <p className="text-zinc-400">No hay comentarios todavía</p>
                  </div>
                )}

                {/* Formulario para nuevo comentario */}
                <form onSubmit={handleSubmitComment}>
                  <div className="mb-4">
                    <label htmlFor="comment-text" className="block text-sm text-zinc-400 mb-2">
                      Añadir comentario
                    </label>
                    <textarea
                      id="comment-text"
                      value={newComment}
                      onChange={handleCommentChange}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Escribe tu comentario..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 flex items-center disabled:opacity-70"
                    >
                      {isSubmittingComment ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Comentar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}