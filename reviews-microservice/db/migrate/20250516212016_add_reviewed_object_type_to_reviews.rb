class AddReviewedObjectTypeToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :reviewed_object_type, :integer
  end
end
