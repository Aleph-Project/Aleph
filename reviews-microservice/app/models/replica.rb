class Replica < ApplicationRecord
  belongs_to :review
  validates :auth_id, presence: true
  validates :replica_body, presence: true
end
