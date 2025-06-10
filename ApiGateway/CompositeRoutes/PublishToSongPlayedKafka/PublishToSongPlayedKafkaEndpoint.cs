using Microsoft.AspNetCore.Mvc;

public static class PublishToSongPlayedKafkaEndpoint
{
    public static void MapPublishToSongPlayedKafkaEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/composite/publish-to-song-played-kafka", async (
            HttpContext context,
            [FromBody] SongPlayedEventDto payload,
            [FromServices] PublishToSongPlayedKafkaService service) =>
        {
            await service.PublishToSongPlayedKafka(payload);
            return Results.Ok();
        });
    }
}