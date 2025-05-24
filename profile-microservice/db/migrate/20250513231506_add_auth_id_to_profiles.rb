class AddAuthIdToProfiles < ActiveRecord::Migration[8.0]
  def change
    add_column :profiles, :auth_id, :string
  end
end
