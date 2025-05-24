using Microsoft.AspNetCore.Mvc;

public static class ReviewsBySongWithProfilesEndpoint
{
    public static void MapReviewsBySongWithProfilesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/composite/reviews-with-profile/{id}", async (HttpContext context, [FromRoute] string id, [FromServices] ReviewsBySongWithProfilesService service) =>
        {
            var result = await service.GetReviewsWithProfileBySong(id);
            return result;
        });
    }
}