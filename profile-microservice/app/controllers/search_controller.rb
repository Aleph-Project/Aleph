class SearchController < ApplicationController
    def profile_search
        query = params[:query]
        if query.present?
            results = Profile.where("name ILIKE ?", "%#{query}%")
            render json: results, status: :ok
        else
            render json: { error: 'Query parameter is required' }, status: :unprocessable_entity
        end
    end
end