using Yarp.ReverseProxy;
using System.Net.Http.Headers;
// using Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddCustomHttpClients(builder.Configuration);

builder.Services.AddScoped<ReviewsBySongWithProfilesService>();
builder.Services.AddScoped<DeleteProfileAllinforService>();


builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("Apigateway"));

var app = builder.Build();


app.MapCompositeRoutes();   
app.MapReverseProxy();

app.Run();
