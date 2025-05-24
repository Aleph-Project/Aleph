class Profile < ApplicationRecord
  belongs_to :city
  has_one_attached :avatar_file # This is the column used for active records
  has_one_attached :background_file
  validates :name, presence: true
  validates :bio, presence: true
  validates :birthday, presence: true
  validates :name, presence: true, length: { minimum: 3, maximum: 20}
  validates :auth_id, presence: true, uniqueness: true
  validate :validate_birthday


  # Validacion para la fecha de nacimiento
  private
  def validate_birthday
    if birthday.present?
      if birthday > Date.today
        errors.add(:birthday, "La fecha de nacimiento no puede ser mayor a la fecha actual")
      end
      if birthday > Date.today - 13.years
        errors.add(:birthday, "La persona debe tener al menos 13 años")
      end
      if birthday < Date.today - 100.years
        errors.add(:birthday, "La persona no puede tener más de 100 años")
      end
    end
  end
end
 