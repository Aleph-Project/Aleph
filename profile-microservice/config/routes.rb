Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"


  post '/api/v1/profiles/create-profile', to: 'profiles#create', as: :create_profile
  get '/api/v1/profiles/search/profiles', to: 'search#profile_search'
  get '/api/v1/profiles/profiles', to: 'profiles#index', as: :profiles
  get '/api/v1/profiles/my-profile/:auth_id', to: 'profiles#show_my_profile', as: :my_profile
  get '/api/v1/profiles/others-profiles/:auth_id', to: 'profiles#show_others_profiles', as: :others_profiles
  patch '/api/v1/profiles/my-profile-update/:auth_id', to: 'profiles#update_my_profile', as: :update_my_profile
  delete '/api/v1/profiles/delete-profile/:auth_id', to: 'profiles#delete_profile', as: :delete_profile
  get '/api/v1/profiles/cities', to: 'cities#index', as: :cities
  get '/api/v1/profiles/exists-profile/:auth_id', to: 'profiles#profile_exists', as: :profile_exists
  post '/api/v1/profiles/auth_batch', to: 'profiles#auth_batch', as: :auth_batch
end
