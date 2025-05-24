require 'rails_helper'

RSpec.describe ReviewsController, type: :controller do
    # test para obtener las reseñas de un perfil
    describe 'GET #reviews_by_profile' do
        let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'title', review_body: 'body', rating: 5, is_public: true, is_song: true) }
        
        context 'con auth_id válido' do
            it 'devuelve las reseñas asociadas al perfil' do
                get :reviews_by_profile, params: { auth_id: review.auth_id }
                expect(response).to have_http_status(:ok)
                expect(JSON.parse(response.body).size).to eq(1)
            end
        end

        context 'sin auth_id' do
            it 'responde con status 400' do
                get :reviews_by_profile, params: { auth_id: '' }
                expect(response).to have_http_status(:bad_request)
            end
        end

        context 'sin reseñas asociadas al perfil' do
            it 'responde con status 404' do
                get :reviews_by_profile, params: { auth_id: 'user2' }
                expect(response).to have_http_status(:not_found)
            end
        end
    end

    describe 'DELETE #destroy' do
        let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'title', review_body: 'body', rating: 5, is_public: true, is_song: true) }
        
        context 'con ID de reseña válido' do
            it 'elimina la reseña y responde con status 200' do
                delete :destroy, params: { id: review.id }
                expect(response).to have_http_status(:ok)
                expect(Review.find_by(id: review.id)).to be_nil
            end
        end

        context 'sin ID de reseña' do
            it 'responde con status 400' do
                delete :destroy, params: { id: '' }
                expect(response).to have_http_status(:bad_request)
            end
        end

        context 'con ID de reseña no existente' do
            it 'responde con status 404' do
                delete :destroy, params: { id: -1 }
                expect(response).to have_http_status(:not_found)
            end
        end
    end

    describe 'DELETE #delete_reviews_by_song' do
        let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'Song title', review_body: 'body', rating: 5, is_public: true, is_song: true) }
        let!(:song_review) { Review.create!(reviewed_object_id: 'shared_id', auth_id: 'user1', review_title: 'Song', review_body: 'body', rating: 5, is_public: true, is_song: true) }
        let!(:album_review) { Review.create!(reviewed_object_id: 'shared_id', auth_id: 'user2', review_title: 'Album', review_body: 'body', rating: 4, is_public: true, is_song: false) }

        context 'con reviewed_object_id válido' do
            it 'elimina las reseñas asociadas a la canción y responde con status 200' do
                delete :delete_reviews_by_song, params: { reviewed_object_id: review.reviewed_object_id }
                expect(response).to have_http_status(:ok)
                expect(Review.where(reviewed_object_id: review.reviewed_object_id)).to be_empty
            end
        end

        context 'sin reviewed_object_id' do
            it 'responde con status 400' do
                delete :delete_reviews_by_song, params: { reviewed_object_id: '' }
                expect(response).to have_http_status(:bad_request)
            end
        end

        context 'sin reseñas asociadas a la canción' do
            it 'responde con status 404' do
                delete :delete_reviews_by_song, params: { reviewed_object_id: 'nonexistent' }
                expect(response).to have_http_status(:not_found)
            end
        end

        context 'album y cancion comparten id' do
            it 'solo elimina las reviews de canciones con el mismo reviewed_object_id' do
            expect {
                delete :delete_reviews_by_song, params: { reviewed_object_id: 'shared_id' }
            }.to change { Review.where(reviewed_object_id: 'shared_id', is_song: true).count }.by(-1)

            expect(Review.where(reviewed_object_id: 'shared_id', is_song: false)).to exist
            expect(Review.where(reviewed_object_id: 'shared_id', is_song: true)).to be_empty
            end
        end
    end

    describe 'DELETE #delete_reviews_by_album' do
        let(:review) { Review.create!(reviewed_object_id: 'obj1', auth_id: 'user1', review_title: 'Song title', review_body: 'body', rating: 5, is_public: true, is_song: false) }
        let!(:song_review) { Review.create!(reviewed_object_id: 'shared_id', auth_id: 'user1', review_title: 'Song', review_body: 'body', rating: 5, is_public: true, is_song: true) }
        let!(:album_review) { Review.create!(reviewed_object_id: 'shared_id', auth_id: 'user2', review_title: 'Album', review_body: 'body', rating: 4, is_public: true, is_song: false) }

        context 'con reviewed_object_id válido' do
            it 'elimina las reseñas asociadas al álbum y responde con status 200' do
                delete :delete_reviews_by_album, params: { reviewed_object_id: review.reviewed_object_id }
                expect(response).to have_http_status(:ok)
                expect(Review.where(reviewed_object_id: review.reviewed_object_id)).to be_empty
            end
        end

        context 'sin reviewed_object_id' do
            it 'responde con status 400' do
                delete :delete_reviews_by_album, params: { reviewed_object_id: '' }
                expect(response).to have_http_status(:bad_request)
            end
        end

        context 'sin reseñas asociadas al álbum' do
            it 'responde con status 404' do
                delete :delete_reviews_by_album, params: { reviewed_object_id: 'nonexistent' }
                expect(response).to have_http_status(:not_found)
            end
        end

        context 'album y cancion comparten id' do 
            it 'solo elimina las reviews de albumes con el mismo reviewed_object_id' do
                expect {
                    delete :delete_reviews_by_album, params: { reviewed_object_id: 'shared_id' }
                }.to change { Review.where(reviewed_object_id: 'shared_id', is_song: false).count }.by(-1)

                expect(Review.where(reviewed_object_id: 'shared_id', is_song: false)).to be_empty
                expect(Review.where(reviewed_object_id: 'shared_id', is_song: true)).to exist
            end
        end
    end

end