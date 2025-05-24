class CreateCities < ActiveRecord::Migration[8.0]
  def change
    create_table :cities do |t|
      t.references :country, null: false, foreign_key: true
      t.text :name

      t.timestamps
    end
  end
end
