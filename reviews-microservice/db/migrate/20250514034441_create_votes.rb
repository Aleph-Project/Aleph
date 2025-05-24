class CreateVotes < ActiveRecord::Migration[8.0]
  def change
    create_table :votes do |t|
      t.references :review, null: false, foreign_key: true
      t.text :auth_id
      t.boolean :type_vote
      t.datetime :timestamp_creation
      t.datetime :timestamp_edit

      t.timestamps
    end
  end
end
