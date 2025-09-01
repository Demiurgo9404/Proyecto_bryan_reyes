using LoveRose.API.Configurations;
using LoveRose.API.Middleware;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configuración de Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    // Configuraciones organizadas por responsabilidad
    builder.Services.AddDatabaseConfiguration(builder.Configuration);
    builder.Services.AddIdentityConfiguration();
    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddCorsConfiguration(builder.Configuration);
    builder.Services.AddSwaggerConfiguration();
    builder.Services.AddApplicationServices();
    builder.Services.AddApiConfiguration();
    builder.Services.AddPaymentConfiguration(builder.Configuration);

    var app = builder.Build();

    // Configuración del pipeline de solicitudes HTTP
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI(c => 
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "LoveRose API v1");
            c.RoutePrefix = "swagger";
        });
    }

    app.UseSerilogRequestLogging();
    app.UseHttpsRedirection();
    app.UseRouting();
    app.UseCors("AllowSpecificOrigins");
    app.UseAuthentication();
    app.UseAuthorization();

    // Middleware personalizado para manejo de excepciones
    app.UseMiddleware<ExceptionMiddleware>();

    app.MapControllers();

    // Aplicar migraciones al iniciar
    await app.ApplyMigrationsAsync();

    Log.Information("Iniciando aplicación LoveRose API");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "La aplicación falló al iniciar");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
