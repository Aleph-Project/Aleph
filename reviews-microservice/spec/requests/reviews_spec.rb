require 'rails_helper'

RSpec.describe "Reviews API", type: :request do
  describe "POST /reviews" do
    let(:valid_song_attributes) do
      {
        reviewed_object_id: 1,
        auth_id: 1,
        review_title: "Amazing Song!",
        review_body: "Loved every part of it.",
        rating: 5,
        is_public: true,
        is_song: true
      }
    end

    let(:valid_album_attributes) do
      {
        reviewed_object_id: 2,
        auth_id: 2,
        review_title: "Incredible Album!",
        review_body: "A masterpiece from start to finish.",
        rating: 5,
        is_public: true,
        is_song: false
      }
    end

    context "when the request is valid for a Song" do
      before { post '/reviews', params: valid_song_attributes, as: :json }

      it "creates a review for a song" do
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['review_title']).to eq("Amazing Song!")
      end

      it "persists the review in the database" do
        review = Review.find_by(review_title: "Amazing Song!")
        expect(review).not_to be_nil
        expect(review.review_body).to eq("Loved every part of it.")
        expect(review.rating).to eq(5)
        expect(review.is_public).to be true
        expect(review.is_song).to be true
      end
    end

    context "when the request is valid for an Album" do
      before { post '/reviews', params: valid_album_attributes, as: :json }

      it "creates a review for an album" do
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['review_title']).to eq("Incredible Album!")
      end

      it "persists the review in the database" do
        review = Review.find_by(review_title: "Incredible Album!")
        expect(review).not_to be_nil
        expect(review.review_body).to eq("A masterpiece from start to finish.")
        expect(review.rating).to eq(5)
        expect(review.is_public).to be true
        expect(review.is_song).to be false
      end
    end

    context "when the request is invalid" do
      before { post '/reviews', params: { review: { review_title: "Missing fields" } }, as: :json }

      it "returns status code 404" do
        expect(response).to have_http_status(:bad_request)
      end

      it "returns a validation failure message" do
        expect(JSON.parse(response.body)['error']).to be_present
      end
    end
  end
end
