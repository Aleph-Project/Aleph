public static class CompositeRoutesExtensions
{
    public static void MapCompositeRoutes(this IEndpointRouteBuilder app)
    {
        app.MapReviewsBySongWithProfilesEndpoint();
        app.MapDeleteProfileAllinfoEndpoint();
        app.MapPublishToSongPlayedKafkaEndpoint();
    }
}