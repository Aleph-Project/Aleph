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
            render json: @review, status: :created
        else
            render json: { 
            error: 'Failed to create review', 
            details: @review.errors.full_messages,
            received_params: params.permit(required_params) # Para debug
            }, status: :unprocessable_entity
        end
    end

    def update
        if @review.nil?
            render json: { error: 'Review not found' }, status: :not_found
        elsif @review.update(review_params)
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
        @reviews = Review.left_joins(:replicas, :votes)
                         .where(auth_id: params[:auth_id], is_public: true)
                         .select('reviews.*, COUNT(DISTINCT replicas.id) as replicas_count, SUM(CASE WHEN votes.type_vote = true THEN 1 ELSE 0 END) as positive_votes, SUM(CASE WHEN votes.type_vote = false THEN 1 ELSE 0 END) as negative_votes')
                         .group('reviews.id')
        if @reviews.empty?
            render json: { message: 'No reviews found for this profile' }, status: :not_found
        else
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
        reviews = Review.left_joins(:replicas, :votes)
                         .where(reviewed_object_id: params[:reviewed_object_id], is_song: true, is_public: true)
                         .select('reviews.*, COUNT(DISTINCT replicas.id) as replicas_count, SUM(CASE WHEN votes.type_vote = true THEN 1 ELSE 0 END) as positive_votes, SUM(CASE WHEN votes.type_vote = false THEN 1 ELSE 0 END) as negative_votes')
                         .group('reviews.id')
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
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
        reviews = Review.left_joins(:replicas, :votes)
                         .where(reviewed_object_id: params[:reviewed_object_id], is_song: false, is_public: true)
                         .select('reviews.*, COUNT(DISTINCT replicas.id) as replicas_count, SUM(CASE WHEN votes.type_vote = true THEN 1 ELSE 0 END) as positive_votes, SUM(CASE WHEN votes.type_vote = false THEN 1 ELSE 0 END) as negative_votes')
                         .group('reviews.id')
        if reviews.empty?
            render json: { message: 'No reviews found for this object' }, status: :not_found
        else
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
        @reviews = Review.left_joins(:replicas, :votes)
                         .where(auth_id: params[:auth_id])
                         .select('reviews.*, COUNT(DISTINCT replicas.id) as replicas_count, SUM(CASE WHEN votes.type_vote = true THEN 1 ELSE 0 END) as positive_votes, SUM(CASE WHEN votes.type_vote = false THEN 1 ELSE 0 END) as negative_votes')
                         .group('reviews.id')
        if @reviews.empty?
            render json: { message: 'No reviews found for this profile' }, status: :not_found
        else
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
end
