require "test_helper"

class ReviewsControllerTest < ActionDispatch::IntegrationTest
  fixtures :reviews

  test "Todas las reseñas de un perfil" do
    get reviews_by_profile_all_path(auth_id: "MyText")
    assert_response :success
  end

  test "Reseñas de una canción" do
    get reviews_by_song_public_path(reviewed_object_id: "1234567aaa")
    assert_response :success
  end

  test "Reseñas de un álbum" do
    album_review = reviews(:two)
    album_review.update(is_public: true)    
    get reviews_by_album_public_path(reviewed_object_id: "1234567bbb")
    assert_response :success
  end

  test "Desocultar reseña" do
    review_to_unhide = reviews(:two)
    patch unhide_review_path(id: review_to_unhide.id) 
    assert_response :success
  end
end
