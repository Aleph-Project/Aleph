class ReplicasController < ApplicationController

    def create
        if params[:review_id].blank? || params[:auth_id].blank? || params[:replica_body].blank?
            render json: { error: 'Parameters review_id, auth_id and replica_body are required' }, status: :bad_request
            return
        end

        @replica = Replica.new(replicas_params)
        if @replica.save
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

        replicas = Replica.where(review_id: params[:review_id])
        if replicas.empty?
            render json: { message: 'No replicas found for this review' }, status: :not_found
        else
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
            replicas.destroy_all
            render json: { message: 'All replicas for the profile deleted successfully' }, status: :ok
        end
    end


    def replicas_params
        params.permit(:review_id, :auth_id, :replica_body)
    end

end
