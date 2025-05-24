public class DeleteProfileAllinforService
{
    private readonly HttpClient _profileClient;
    private readonly HttpClient _reviewClient;

    public DeleteProfileAllinforService(IHttpClientFactory httpClientFactory)
    {
        _profileClient = httpClientFactory.CreateClient("Profiles");
        _reviewClient = httpClientFactory.CreateClient("Reviews");
    }

    public async Task<object> DeleteProfileAsync(string id)
    {
        var requestBody = new { auth_id = id };

        var deleteReplicasRequest = new HttpRequestMessage(HttpMethod.Delete, "/api/v1/reviews/delete_replicas_by_profile")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json")
        };
        var replicasDeleteResponse = await _profileClient.SendAsync(deleteReplicasRequest);
        if (!replicasDeleteResponse.IsSuccessStatusCode && replicasDeleteResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new Exception("Failed to delete replicas for profile");
        }

        var deleteReviewsRequest = new HttpRequestMessage(HttpMethod.Delete, "/api/v1/reviews/delete_reviews_by_profile")
        {
            Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json")
        };
        var reviewsDeleteResponse = await _reviewClient.SendAsync(deleteReviewsRequest);
        if (!reviewsDeleteResponse.IsSuccessStatusCode && replicasDeleteResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new Exception("Failed to delete reviews for profile");
        }

        var profileDeleteResponse = await _profileClient.DeleteAsync($"/api/v1/profiles/delete-profile/{id}");
        if (!profileDeleteResponse.IsSuccessStatusCode)
        {
            throw new Exception("Failed to delete profile");
        }

        return new { message = "Profile and associated reviews and comments deleted successfully" };
    }
}