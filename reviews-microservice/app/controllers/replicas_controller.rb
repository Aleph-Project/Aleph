class ReplicasController < ApplicationController

    def create
        if params[:review_id].blank? || params[:auth_id].blank? || params[:replica_body].blank?
            render json: { error: 'Parameters review_id, auth_id and replica_body are required' }, status: :bad_request
            return
        end

        @replica = Replica.new(replicas_params)
        if @replica.save
            invalidate_replica_cache(@replica)
            render json: @replica, status: :created
        else
            render json: { error: 'Failed to create replica', details: @replica.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def by_review
        if params[:review_id].blank?
            render json: { error: 'Parameter review_id is required' }, status: :bad_request
            return
        end

        cache = CacheService.new
        cache_key = "replicas:review:#{params[:review_id]}"

        cached = cache.fetch(cache_key)
        if cached
            render json: cached and return
        end

        replicas = Replica.where(review_id: params[:review_id])
        if replicas.empty?
            render json: { message: 'No replicas found for this review' }, status: :not_found
        else
            cache.write(cache_key, replicas)
            render json: replicas, status: :ok
        end
    end

    def delete_replicas_by_profile
        if params[:auth_id].blank?
            render json: { error: "Parameter 'auth_id' is required" }, status: :bad_request
            return
        end

        replicas = Replica.where(auth_id: params[:auth_id])
        if replicas.empty?
            render json: { message: 'No replicas found for this profile' }, status: :not_found
        else
            replicas.each { |replica| invalidate_replica_cache(replica) }
            replicas.destroy_all
            render json: { message: 'All replicas for the profile deleted successfully' }, status: :ok
        end
    end


    def replicas_params
        params.permit(:review_id, :auth_id, :replica_body)
    end

    def invalidate_replica_cache(replica)
        cache = CacheService.new
        
        #réplicas por review
        cache.delete("replicas:review:#{replica.review_id}")
        
        #réplicas por perfil
        cache.delete("replicas:profile:#{replica.auth_id}")
    end

end
