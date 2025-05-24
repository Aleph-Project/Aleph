class RemoveReviewedKindFromReviews < ActiveRecord::Migration[8.0]
  def change
    remove_column :reviews, :reviewed_kind, :integer
  end
end
