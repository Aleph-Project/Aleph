class RemoveTimestampsFromReviewsReplicasVotes < ActiveRecord::Migration[8.0]
  def change
    remove_column :reviews, :timestamp_creation, :datetime
    remove_column :reviews, :timestamp_edit, :datetime

    remove_column :replicas, :timestamp_creation, :datetime
    remove_column :replicas, :timestamp_edit, :datetime

    remove_column :votes, :timestamp_creation, :datetime
    remove_column :votes, :timestamp_edit, :datetime
  end
end
