class Vote < ApplicationRecord
  belongs_to :review
  validates :auth_id, presence: true
  validates :type_vote, inclusion: { in: [true, false] }
end
