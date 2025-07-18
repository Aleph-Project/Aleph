class HealthController < ApplicationController
    def show
      Rails.logger.info "HEALTH CHECK RECIBIDO en PROFILE"
      render json: { status: 'ok' }, status: :ok
    end
  end 