class ChangeAuthIdToNotNullInProfiles < ActiveRecord::Migration[8.0]
  def change
    change_column_null :profiles, :auth_id, false
  end
end