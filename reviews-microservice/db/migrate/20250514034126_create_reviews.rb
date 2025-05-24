class CreateReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :reviews do |t|
      t.text :reviewed_object_id
      t.text :auth_id
      t.text :review_title
      t.text :review_body
      t.integer :rating
      t.datetime :timestamp_creation
      t.datetime :timestamp_edit
      t.boolean :is_public

      t.timestamps
    end
  end
end
