class HealthController < ApplicationController
    def show
      Rails.logger.info "HEALTH CHECK RECIBIDO en REVIEWS"
      render json: { status: 'ok' }, status: :ok
    end
  end 