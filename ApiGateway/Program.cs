using Yarp.ReverseProxy;
using System.Net.Http.Headers;
using Confluent.Kafka;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddCustomHttpClients(builder.Configuration);

// Configuración de autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Ajustar según tu configuración
            ValidateAudience = false, // Ajustar según tu configuración  
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JWT_SECRET"] ?? "your-secret-key-here"))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IProducer<string, string>>(sp =>
{
    var config = new ProducerConfig
    {
        BootstrapServers = "aleph_message_queue:9092"
    };
    return new ProducerBuilder<string, string>(config).Build();
});

builder.Services.AddScoped<ReviewsBySongWithProfilesService>();
builder.Services.AddScoped<DeleteProfileAllinforService>();
builder.Services.AddScoped<PublishToSongPlayedKafkaService>();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("Apigateway"));

var app = builder.Build();

// Middleware de autenticación
app.UseAuthentication();

// Middleware personalizado para excluir rutas de auth
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    
    // Excluir rutas de auth de la validación de tokens
    if (path.StartsWith("/api/v1/auth"))
    {
        await next();
        return;
    }
    
    // Para todas las demás rutas API, verificar el token
    if (path.StartsWith("/api/"))
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
        
        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("{\"error\":\"Token requerido\"}");
            return;
        }
        
        // Aquí el middleware JWT ya validó el token automáticamente
        // Si llegamos hasta aquí, el token es válido
    }
    
    await next();
});

app.UseAuthorization();

app.MapCompositeRoutes();   
app.MapReverseProxy();

app.Run();
