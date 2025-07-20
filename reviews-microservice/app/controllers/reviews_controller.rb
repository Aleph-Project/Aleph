class ReviewsController < ApplicationController
    before_action :set_review, only: [:update]

    def create
       
        required_params = [:reviewed_object_id, :auth_id, :review_title, :review_body, :rating, :is_song]
        

        missing_params = required_params.select { |p| params[p].blank? && params[:review].try(:[], p).blank? }
        
        unless missing_params.empty?
            render json: { error: "Missing required parameter(s): #{missing_params.join(', ')}" }, status: :bad_request
            return
        end

        # Establecer valor por defecto para is_public si no viene en la petición
        review_params_with_defaults = review_params.to_h
        review_params_with_defaults[:is_public] = true if review_params_with_defaults[:is_public].nil?

        # Crear la review con los parámetros ajustados
        @review = Review.new(review_params_with_defaults)

        if @review.save
            invalidate_review_cache(@review)
            render json: @review, status: :created
        else
            render json: { 
                error: 'Failed to create review', 
                details: @review.errors.full_messages,
                received_params: params.permit(required_params)
            }, status: :unprocessable_entity
        end
    end

    def update
        if @review.nil?
            render json: { error: 'Review not found' }, status: :not_found
        elsif @review.update(review_params)
            invalidate_review_cache(@review)
            render json: @review, status: :ok
        else
            render json: { error: 'Failed to update review', details: @review.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def destroy
        if params[:id].blank?
            render json: {error: 'Parameter id is required'}, status: :bad_request
            return
        end
        if @review = Review.find_by(id: params[:id])
            if @review.destroy
                invalidate_review_cache(@review)
                render json: { message: 'Review deleted successfully' }, status: :ok
            else
                render json: { error: 'Failed to delete review', details: @review.errors.full_messages }, status: :unprocessable_entity
            end
        else
            render json: { error: 'Review not found' }, status: :not_found
        end
    end

    # Obtener las reseñas de un perfil
    def reviews_by_profile
        if params[:review][:auth_id].blank?
            render json: { error: "Parameter 'auth_id' is required" }, status: :bad_request
            return
        end

        cache = CacheService.new
        cache_key = "reviews:profile:#{params[:auth_id]}"

        cached = cache.fetch(cache_key)
        if cached
            render json: cached and return
        end

        @reviews = Review.where(auth_id: params[:review][:auth_id], is_public: true)
                            .select(
                                'reviews.id, 
                                reviews.reviewed_object_id, reviews.auth_id, 
                                reviews.review_title, 
                                reviews.review_body, 
                                reviews.rating, 
                                reviews.is_public,
                                reviews.created_at,
                                reviews.updated_at,
                                reviews.is_song,
                                (SELECT COUNT(*) FROM replicas WHERE replicas.review_id = reviews.id) AS replicas_count,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = true) AS positive_votes,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = false) AS negative_votes'
                            )
                            .group('reviews.id')
                            .order(created_at: :desc)
        if @reviews.empty?
            render json: { message: 'No reviews found for this profile' }, status: :not_found
        else
            cache.write(cache_key, @reviews)
            render json: @reviews, status: :ok
        end
    end

    # Borrar todas las reseñas de una cancion
    def delete_reviews_by_song
        if params[:review][:reviewed_object_id].blank?
            render json: { error: "Parameter 'reviewed_object_id' is required" }, status: :bad_request
            return
        end

        reviews = Review.where(reviewed_object_id: params[:review][:reviewed_object_id], is_song: true)
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
            reviews.each { |review| invalidate_review_cache(review) }
            reviews.destroy_all
            render json: { message: 'All reviews for the object deleted successfully' }, status: :ok
        end
    end

    # Borrar todas las reseñas de un album
    def delete_reviews_by_album
        if params[:review][:reviewed_object_id].blank?
            render json: { error: "Parameter 'reviewed_object_id' is required" }, status: :bad_request
            return
        end

        reviews = Review.where(reviewed_object_id: params[:review][:reviewed_object_id], is_song: false)
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
            reviews.each { |review| invalidate_review_cache(review) }
            reviews.destroy_all
            render json: { message: 'All reviews for the object deleted successfully' }, status: :ok
        end
    end

    # Visualizar reseñas de una canción - Públicas
    # En este caso, deben ser públicas para mostrarse.
    def reviews_by_song_public
        if params[:reviewed_object_id].blank?
            render json: { error: "Parameter 'reviewed_object_id' is required" }, status: :bad_request
            return
        end

        cache = CacheService.new
        cache_key = "reviews:song:public:#{params[:reviewed_object_id]}"

        cached = cache.fetch(cache_key)
        if cached
            render json: cached and return
        end

        reviews = Review.where(reviewed_object_id: params[:reviewed_object_id], is_song: true, is_public: true)
                            .select(
                                'reviews.id, 
                                reviews.reviewed_object_id, reviews.auth_id, 
                                reviews.review_title, 
                                reviews.review_body, 
                                reviews.rating, 
                                reviews.is_public,
                                reviews.created_at,
                                reviews.updated_at,
                                reviews.is_song,
                                (SELECT COUNT(*) FROM replicas WHERE replicas.review_id = reviews.id) AS replicas_count,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = true) AS positive_votes,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = false) AS negative_votes'
                            )
                            .group('reviews.id')
                            .order(created_at: :desc)
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
            cache.write(cache_key, reviews)
            render json: reviews, status: :ok
        end
    end

    # Visualizar reseñas de un álbum - Públicas
    # En este caso, deben ser públicas para mostrarse.
    def reviews_by_album_public
        if params[:reviewed_object_id].blank?
            render json: { error: "Parameter 'reviewed_object_id' is required" }, status: :bad_request
            return
        end

        cache = CacheService.new
        cache_key = "reviews:album:public:#{params[:reviewed_object_id]}"

        cached = cache.fetch(cache_key)
        if cached
            render json: cached and return
        end

        reviews = Review.where(reviewed_object_id: params[:reviewed_object_id], is_song: false, is_public: true)
                            .select(
                                'reviews.id, 
                                reviews.reviewed_object_id, reviews.auth_id, 
                                reviews.review_title, 
                                reviews.review_body, 
                                reviews.rating, 
                                reviews.is_public,
                                reviews.created_at,
                                reviews.updated_at,
                                reviews.is_song,
                                (SELECT COUNT(*) FROM replicas WHERE replicas.review_id = reviews.id) AS replicas_count,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = true) AS positive_votes,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = false) AS negative_votes'
                            )
                            .group('reviews.id')
                            .order(created_at: :desc)
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
            cache.write(cache_key, reviews)
            render json: reviews, status: :ok
        end
    end

    # Visualizar reseñas del perfil - Todas las reseñas
    # Incluyendo públicas como privadas.
    def reviews_by_profile_all
        if params[:auth_id].blank?
            render json: { error: "Parameter 'auth_id' is required" }, status: :bad_request
            return
        end

        cache = CacheService.new
        cache_key = "reviews:profile:all:#{params[:reviewed_object_id]}"

        cached = cache.fetch(cache_key)
        if cached
            render json: cached and return
        end

        @reviews = Review.where(auth_id: params[:review][:auth_id])
                            .select(
                                'reviews.id, 
                                reviews.reviewed_object_id, reviews.auth_id, 
                                reviews.review_title, 
                                reviews.review_body, 
                                reviews.rating, 
                                reviews.is_public,
                                reviews.created_at,
                                reviews.updated_at,
                                reviews.is_song,
                                (SELECT COUNT(*) FROM replicas WHERE replicas.review_id = reviews.id) AS replicas_count,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = true) AS positive_votes,
                                (SELECT COUNT(*) FROM votes WHERE votes.review_id = reviews.id AND votes.type_vote = false) AS negative_votes'
                            )
                            .group('reviews.id')
                            .order(created_at: :desc)
        if @reviews.empty?
            render json: { message: 'No reviews found for this profile' }, status: :not_found
        else
            cache.write(cache_key, @reviews)
            render json: @reviews, status: :ok
        end
    end

    # Desocultar una reseña
    def unhide_review
        if params[:id].blank?
            render json: { error: "Parameter 'id' is required" }, status: :bad_request
            return
        end
        @review = Review.find_by(id: params[:id], is_public: false)
        if @review.nil?
            render json: { error: 'Review not found or already public' }, status: :not_found
        else
            @review.is_public = true
            if @review.save
                reviews.each { |review| invalidate_review_cache(review) }
                render json: { message: 'Review made public successfully' }, status: :ok
            else
                render json: { error: 'Failed to make review public', details: @review.errors.full_messages }, status: :unprocessable_entity, details: @review.errors.full_messages
            end
        end
    end

    def delete_reviews_by_profile
        if params[:auth_id].blank?
            render json: { error: "Parameter 'auth_id' is required" }, status: :bad_request
            return
        end

        reviews = Review.where(auth_id: params[:auth_id])
        if reviews.empty?
            render json: { message: 'No reviews found for this profile' }, status: :not_found
        else
            reviews.each { |review| invalidate_review_cache(review) }
            reviews.destroy_all
            render json: { message: 'All reviews for the profile deleted successfully' }, status: :ok
        end
    end

    def set_review
        @review = Review.find_by(id: params[:id])
    end

    def review_params
    # Si los parámetros están anidados dentro de :review, úsalos
    if params[:review].present?
        params.require(:review).permit(
        :reviewed_object_id, 
        :auth_id, 
        :review_title, 
        :review_body, 
        :rating, 
        :is_public, 
        :is_song
        )
    else
        # Si no están anidados, usa los parámetros de la raíz
        params.permit(
        :reviewed_object_id, 
        :auth_id, 
        :review_title, 
        :review_body, 
        :rating, 
        :is_public, 
        :is_song
        )
    end
    end

    #Invalidar cache
    def invalidate_review_cache(review)
        cache = CacheService.new
        #perfiles
        cache.delete("reviews:profile:#{review.auth_id}")
        #reviews por perfil (todas)
        cache.delete("reviews:profile:all:#{review.auth_id}")
        
        #reeviews por canción o álbum
        if review.is_song
            cache.delete("reviews:song:public:#{review.reviewed_object_id}")
        else
            cache.delete("reviews:album:public:#{review.reviewed_object_id}")
        end
    end
end
