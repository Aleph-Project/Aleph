require 'test_helper'
class ProfilesControllerTest < ActionDispatch::IntegrationTest
  test 'Obtención de todos los perfiles' do
    get profiles_path
    assert_response :success 
  end

  test 'Obtención de mi perfil' do
    get my_profile_path(auth_id: "1234567aaa")
    assert_response :success
  end

  test 'Obtención de perfiles de otros usuarios' do
    get others_profiles_path(auth_id: "1234567aaa")
    assert_response :success
  end

  test 'Actualizacion de datos de un perfil' do
    patch update_my_profile_path(auth_id: "1234567aaa"), 
    params: {
      profile: {
        name: "Juanito",
        birthday: "2000-01-01",
        city_id: cities.second.id,
        timestamp_creation: nil,
        timestamp_edit: Time.current
      }
    }, as: :json
    assert_response :success
  end

  test 'Eliminacion de un perfil' do
    delete delete_profile_path(auth_id: "1234567aaa")
    assert_response :success
  end
end
