public static class HttpClientsRegistry
{
    public static void AddCustomHttpClients(this IServiceCollection services, IConfiguration config)
    {
        services.AddHttpClient("Profiles", c =>
        {
            c.BaseAddress = new Uri(config["Services:Profiles"]);
        });

        services.AddHttpClient("Reviews", c =>
        {
            c.BaseAddress = new Uri(config["Services:Reviews"]);
        });
    }
}
