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
  post 'api/v1/reviews/replicas', to: 'replicas#create'
  post 'api/v1/reviews', to: 'reviews#create'

  get 'api/v1/reviews/by_song', to: 'reviews#reviews_by_song_public', as: :reviews_by_song_public
  get 'api/v1/reviews/by_album', to: 'reviews#reviews_by_album_public', as: :reviews_by_album_public
  get 'api/v1/reviews/by_profile_all', to: 'reviews#reviews_by_profile_all', as: :reviews_by_profile_all
  get 'api/v1/reviews/by_profile', to: 'reviews#reviews_by_profile'
  get 'api/v1/reviews/replicas/by_review', to: 'replicas#by_review'

  patch 'api/v1/reviews/:id/unhide/', to: 'reviews#unhide_review', as: :unhide_review
  put 'api/v1/reviews/:id', to: 'reviews#update'

  delete 'api/v1/reviews/delete_reviews_by_profile', to: 'reviews#delete_reviews_by_profile'
  delete 'api/v1/reviews/delete_replicas_by_profile', to: 'replicas#delete_replicas_by_profile'
  delete 'api/v1/reviews/delete_reviews_by_song', to: 'reviews#delete_reviews_by_song'
  delete 'api/v1/reviews/delete_reviews_by_album', to: 'reviews#delete_reviews_by_album'
  delete 'api/v1/reviews/:id', to: 'reviews#destroy'


  #

end
