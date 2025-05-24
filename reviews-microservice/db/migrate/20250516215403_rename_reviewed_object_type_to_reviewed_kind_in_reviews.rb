class RenameReviewedObjectTypeToReviewedKindInReviews < ActiveRecord::Migration[8.0]
  def change
    rename_column :reviews, :reviewed_object_type, :reviewed_kind
  end
end
