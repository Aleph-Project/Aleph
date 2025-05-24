class RemoveColumnsFromProfiles < ActiveRecord::Migration[8.0]
  def change
    remove_column :profiles, :avatar_url, :text
    remove_column :profiles, :wallpaper_url, :text
    remove_column :profiles, :timestamp_creation, :datetime
    remove_column :profiles, :timestamp_edit, :datetime
  end
end
