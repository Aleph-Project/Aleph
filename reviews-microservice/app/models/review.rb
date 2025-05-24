class Review < ApplicationRecord
  has_many :replicas, dependent: :destroy
  has_many :votes, dependent: :destroy
  validates :auth_id, presence: true
  validates :review_title, presence: true
  validates :review_body, presence: true
  validates :rating, presence: true
  validates :is_public, inclusion: { in: [true, false] }
  validates :reviewed_object_id, presence: true
  validates :is_song, inclusion: { in: [true, false] } # Nuevo booleano
end
  