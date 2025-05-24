// Interface para las reseñas
export interface Review {
  id: string;
  reviewed_object_id: string;
  auth_id: string;
  review_title: string;
  review_body: string;
  rating: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_song: boolean;
  replicas_count: number;
  positive_votes: number;
  negative_votes: number;
}

// Interface para las réplicas (comentarios en reseñas)
export interface Replica {
  id: string;
  review_id: string;
  auth_id: string;
  replica_body: string;
  created_at: string
  updated_at: string
}

// URL base del microservicio de Reviews
const REVIEWS_API_URL = '/api/v1/reviews';

/**
 * Obtiene todas las reseñas de un perfil específico
 * @param authId - ID de autenticación del usuario
 * @returns Promise con un array de reseñas
 */
export async function getReviewsByProfile(authId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/by_profile?auth_id=${authId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();

  } catch (error) {
    console.error('Error fetching reviews by profile:', error);
    throw error;
  }
}

export async function getAllReviewsByProfile(authId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/by_profile_all?auth_id=${authId}`);

    if(!response.ok){
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching all reviews by profile:', error);
    throw error;
  }
}
       
export async function getReviewsBySong(songId: string): Promise<Review[] | null> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/by_song?reviewed_object_id=${songId}`);

    if (response.ok) {
      return response.json();
    }

    if (response.status === 404) {
      return null; // No hay reseñas para esta canción
    }

    const errorData = await response.json();
    return Promise.reject(new Error(`Error: ${response.status} ${errorData.error || response.statusText}`));
  }
  catch (error) {
    console.error('Error fetching reviews by song:', error);
    throw error;
  }
}

/**
 * Crea una nueva reseña
 * @param review - Datos de la reseña a crear
 * @returns Promise con la reseña creada
 */
export async function createReview(review: {
  reviewed_object_id: string;
  auth_id: string;
  review_title: string;
  review_body: string;
  rating: number;
  is_public?: boolean;
  is_song: boolean;
}): Promise<Review> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Actualiza una reseña existente
 * @param id - ID de la reseña a actualizar
 * @param reviewData - Datos a actualizar
 * @returns Promise con la reseña actualizada
 */
export async function updateReview(id: string, reviewData: Partial<Review>): Promise<Review> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Elimina una reseña
 * @param id - ID de la reseña a eliminar
 * @returns Promise con mensaje de confirmación
 */
export async function deleteReview(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Crea una nueva réplica (comentario) en una reseña
 * @param replica - Datos de la réplica a crear
 * @returns Promise con la réplica creada
 */
export async function createReplica(replica: {
  review_id: string;
  auth_id: string;
  replica_body: string;
}): Promise<Replica> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/replicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replica),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating replica:', error);
    throw error;
  }
}

/**
 * Obtiene todas las réplicas de una reseña específica
 * @param reviewId - ID de la reseña
 * @returns Promise con un array de réplicas
 */
export async function getReplicasByReview(reviewId: string): Promise<Replica[]> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/replicas/by_review?review_id=${reviewId}`);
    
    if (response.status === 404) {
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching replicas by review:', error);
    throw error;
  }
}

/**
 * Elimina todas las reseñas asociadas a una canción
 * @param songId - ID de la canción
 * @returns Promise con mensaje de confirmación
 */
export async function deleteReviewsBySong(songId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/delete_reviews_by_song?reviewed_object_id=${songId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting reviews by song:', error);
    throw error;
  }
}

/**
 * Elimina todas las reseñas asociadas a un álbum
 * @param albumId - ID del álbum
 * @returns Promise con mensaje de confirmación
 */
export async function deleteReviewsByAlbum(albumId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${REVIEWS_API_URL}/delete_reviews_by_album?reviewed_object_id=${albumId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting reviews by album:', error);
    throw error;
  }
}
