include Rails.application.routes.url_helpers

class ProfilesController < ApplicationController
    before_action :set_profile, only: [:delete_profile, :update_my_profile]

    # Visualización de perfiles

    def index
      @profiles = Profile.joins(city: :country)
      render json: @profiles.map { |profile|
        profile.as_json(include: { city: { include: :country } }).merge(
          avatar_url: profile.avatar_file.attached? ? profile.avatar_file.blob.url : nil,
          background_url: profile.background_file.attached? ? profile.background_file.blob.url : nil
        )
      }
    end

    # Obtención de mi perfil

    def show_my_profile
      auth_id = params[:auth_id]
      @profile = Profile.joins(city: :country).find_by(auth_id: auth_id)
      if @profile.nil?
        render json: { error: 'No se encontró el perfil' }, status: :not_found
      else
        render json:{
          profile: @profile.as_json(include: { city: { include: :country } }),
          avatar_url: @profile.avatar_file.attached? ? @profile.avatar_file.blob.url : nil,
          background_url: @profile.background_file.attached? ? @profile.background_file.blob.url : nil
        }
      end
    end

    def create
        @profile = Profile.new(profile_params)
        if @profile.save
            render json: @profile, status: :created
        else
            render json: @profile.errors, status: :unprocessable_entity
        end
    end

    def show_others_profiles
      auth_id = params[:auth_id]
      @profiles = Profile.joins(city: :country).where.not(auth_id: auth_id)
      if @profiles.nil?
        render json: { error: 'No se encontró el perfil' }, status: :not_found
      else
        if @profiles.empty?
          render json: { error: 'No se encontraron perfiles' }, status: :not_found
        else
          render json: @profiles.as_json(include: { city: { include: :country } })
        end
      end
    end

    def update_my_profile
      auth_id = params[:auth_id]
      @profile = Profile.joins(city: :country).find_by(auth_id: auth_id)
      if @profile.nil?
        render json: { error: 'No se encontró el perfil' }, status: :not_found
      else
        if @profile.update(profile_params)
          render json: @profile.as_json(include: { city: { include: :country } }), status: :ok
        else
          render json: {
            error: 'Error al actualizar el perfil',
            details: @profile.errors.full_messages
          }, status: :unprocessable_entity
        end
      end
    end

    def delete_profile
      auth_id = params[:auth_id]
      @profile = Profile.joins(city: :country).find_by(auth_id: auth_id)
      if @profile.nil?
        render json: { error: 'No se encontró el perfil' }, status: :not_found
      else
        if @profile.destroy
          render json: { message: 'Perfil eliminado correctamente' }, status: :ok
        else
          render json: { error: 'Error al eliminar el perfil' }, status: :unprocessable_entity, details: @profile.errors.full_messages
        end
      end
    end

    def profile_exists
      auth_id = params[:auth_id]
      exists = Profile.exists?(auth_id: auth_id)
      render json: { exists: exists }
    end

    def auth_batch
      auth_ids = params[:auth_ids] || []
      if !auth_ids.is_a?(Array) || auth_ids.empty?
        render json: { error: 'auth_ids debe ser un array no vacío' }, status: :bad_request
        return
      end

      @profiles = Profile.where(auth_id: auth_ids)
      render json: @profiles.map { |profile|
        profile.as_json(include: { city: { include: :country } }).merge(
          avatar_url: profile.avatar_file.attached? ? profile.avatar_file.blob.url : nil,
          background_url: profile.background_file.attached? ? profile.background_file.blob.url : nil
        )
      }
    end

    def set_profile
        @profile = Profile.find_by(auth_id: params[:auth_id])
    end

    def profile_params
        params.require(:profile).permit(:auth_id, :name, :bio, :birthday, :city_id, :avatar_file, :background_file)
    end
end
