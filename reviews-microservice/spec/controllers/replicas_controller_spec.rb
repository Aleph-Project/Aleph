require 'rails_helper'

RSpec.describe ReplicasController, type: :controller do
  describe 'POST #create' do
    let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'title', review_body: 'body', rating: 5, is_public: true, is_song: true) }

    context 'con parámetros válidos' do
      it 'crea una nueva réplica y responde con status 201' do
        expect {
          post :create, params: { review_id: review.id, auth_id: 'user2', replica_body: 'Texto de réplica' }
        }.to change(Replica, :count).by(1)
        expect(response).to have_http_status(:created)
      end
    end

    context 'con parámetros inválidos' do
      it 'no crea réplica y responde con status 400' do
        post :create, params: { review_id: '', auth_id: '', replica_body: '' }
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe 'GET #by_review' do
    let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'title', review_body: 'body', rating: 5, is_public: true, is_song: true) }
    let!(:replica) { Replica.create!(review_id: review.id, auth_id: 'user2', replica_body: 'Texto de réplica') }

    context 'con un ID de reseña válido' do
      it 'devuelve las réplicas asociadas a la reseña' do
        get :by_review, params: { review_id: review.id }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
      end
    end

    context 'sin un ID de reseña' do
      it 'responde con status 400' do
        get :by_review, params: { review_id: '' }
        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'sin réplicas asociadas a la reseña' do
      it 'responde con status 404' do
        get :by_review, params: { review_id: -1 }
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end