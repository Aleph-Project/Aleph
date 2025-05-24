# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_05_16_220907) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "replicas", force: :cascade do |t|
    t.bigint "review_id", null: false
    t.text "auth_id"
    t.text "replica_body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["review_id"], name: "index_replicas_on_review_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.text "reviewed_object_id"
    t.text "auth_id"
    t.text "review_title"
    t.text "review_body"
    t.integer "rating"
    t.boolean "is_public"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_song"
  end

  create_table "votes", force: :cascade do |t|
    t.bigint "review_id", null: false
    t.text "auth_id"
    t.boolean "type_vote"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["review_id"], name: "index_votes_on_review_id"
  end

  add_foreign_key "replicas", "reviews"
  add_foreign_key "votes", "reviews"
end
