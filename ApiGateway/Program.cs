using Yarp.ReverseProxy;
using System.Net.Http.Headers;
using Confluent.Kafka;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddCustomHttpClients(builder.Configuration);

builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var config = new ProducerConfig
    {
        BootstrapServers = "kafka:9092"
    };
    return new ProducerBuilder<string, string>(config).Build();
});

builder.Services.AddScoped<ReviewsBySongWithProfilesService>();
builder.Services.AddScoped<DeleteProfileAllinforService>();
builder.Services.AddScoped<PublishToSongPlayedKafkaService>();


builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("Apigateway"));

var app = builder.Build();


app.MapCompositeRoutes();   
app.MapReverseProxy();

app.Run();
