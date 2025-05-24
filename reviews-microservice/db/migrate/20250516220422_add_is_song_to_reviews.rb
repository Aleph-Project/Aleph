class AddIsSongToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :is_song, :boolean
  end
end
