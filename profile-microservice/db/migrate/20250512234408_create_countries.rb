class CreateCountries < ActiveRecord::Migration[8.0]
  def change
    create_table :countries do |t|
      t.text :name

      t.timestamps
    end
  end
end
