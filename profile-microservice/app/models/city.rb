class City < ApplicationRecord
  belongs_to :country
  has_many :profiles, dependent: :destroy
  validates :name, presence: true
  validates :country_id, presence: true
end
