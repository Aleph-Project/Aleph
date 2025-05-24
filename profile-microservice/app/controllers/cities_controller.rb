class CitiesController < ApplicationController

  # Visualización de ciudades y paises
  def index
    @cities = City.joins(:country)
    render json: @cities.as_json(include: :country)
  end
end