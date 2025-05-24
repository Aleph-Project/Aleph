using System.Text.Json.Serialization;

public class ReviewDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("reviewed_object_id")]
    public string ReviewedObjectId { get; set; }

    [JsonPropertyName("auth_id")]
    public string AuthId { get; set; }

    [JsonPropertyName("review_title")]
    public string ReviewTitle { get; set; }

    [JsonPropertyName("review_body")]
    public string ReviewBody { get; set; }

    [JsonPropertyName("rating")]
    public int Rating { get; set; }

    [JsonPropertyName("is_public")]
    public bool IsPublic { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("is_song")]
    public bool IsSong { get; set; }

    [JsonPropertyName("replicas_count")]
    public int ReplicasCount { get; set; }

    [JsonPropertyName("positive_votes")]
    public int PositiveVotes { get; set; }

    [JsonPropertyName("negative_votes")]
    public int NegativeVotes { get; set; }
}

public class ProfileDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("city_id")]
    public int CityId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("bio")]
    public string Bio { get; set; }

    [JsonPropertyName("birthday")]
    public DateTime Birthday { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("auth_id")]
    public string AuthId { get; set; }

    [JsonPropertyName("city")]
    public CityDto City { get; set; }

    [JsonPropertyName("avatar_url")]
    public string AvatarUrl { get; set; }

    [JsonPropertyName("background_url")]
    public string BackgroundUrl { get; set; }
}

public class CityDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("country_id")]
    public int CountryId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("country")]
    public CountryDto Country { get; set; }
}

public class CountryDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

public class ReviewWithProfileDto
{
    public ReviewDto Review { get; set; }
    public ProfileDto Profile { get; set; }
}

public class ReviewsBySongWithProfilesResponse
{
    public List<ReviewWithProfileDto> ReviewsWithProfiles { get; set; }
}