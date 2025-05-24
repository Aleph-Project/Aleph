using Microsoft.AspNetCore.Mvc;

public static class DeleteProfileAllinfoEndpoint
{
    public static void MapDeleteProfileAllinfoEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/v1/composite/delete-profile/{id}", async (HttpContext context, [FromRoute] string id, [FromServices] DeleteProfileAllinforService service) =>
        {
            var result = await service.DeleteProfileAsync(id);
            return result;
        });
    }
}