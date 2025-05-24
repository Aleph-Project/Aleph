public class ReviewsBySongWithProfilesService
{
    private readonly HttpClient _profileClient;
    private readonly HttpClient _reviewClient;

    public ReviewsBySongWithProfilesService(IHttpClientFactory httpClientFactory)
    {
        _profileClient = httpClientFactory.CreateClient("Profiles");
        _reviewClient = httpClientFactory.CreateClient("Reviews");
    }
    
    public async Task<ReviewsBySongWithProfilesResponse> GetReviewsWithProfileBySong(string songId)
    {
        var reviews = await _reviewClient.GetFromJsonAsync<List<ReviewDto>>($"/api/v1/reviews/by_song?reviewed_object_id={songId}");
        if (reviews == null || !reviews.Any())
        {
            return new ReviewsBySongWithProfilesResponse { ReviewsWithProfiles = new List<ReviewWithProfileDto>() };
        }

        var distinctAuthIds = reviews.Select(r => r.AuthId).Where(Id => Id != null).Distinct().ToArray();

        var requestBody = new { auth_ids = distinctAuthIds };
        var response = await _profileClient.PostAsJsonAsync("/api/v1/profiles/auth_batch", requestBody);

        if (!response.IsSuccessStatusCode)
        {
             return new ReviewsBySongWithProfilesResponse { ReviewsWithProfiles = new List<ReviewWithProfileDto>() };
        }

        var profiles = await response.Content.ReadFromJsonAsync<List<ProfileDto>>();

        var reviewsWithProfiles = reviews.Select(review =>
        {
            var profile = profiles.FirstOrDefault(p => p.AuthId == review.AuthId);
            return new ReviewWithProfileDto
            {
                Review = review,
                Profile = profile
            };
        }).ToList();

        return new ReviewsBySongWithProfilesResponse
        {
            ReviewsWithProfiles = reviewsWithProfiles
        };
    }


}