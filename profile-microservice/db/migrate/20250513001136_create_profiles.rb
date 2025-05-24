class CreateProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :profiles do |t|
      t.references :city, null: false, foreign_key: true
      t.text :name
      t.text :bio
      t.date :birthday
      t.text :avatar_url
      t.text :wallpaper_url
      t.datetime :timestamp_creation
      t.datetime :timestamp_edit

      t.timestamps
    end
  end
end
