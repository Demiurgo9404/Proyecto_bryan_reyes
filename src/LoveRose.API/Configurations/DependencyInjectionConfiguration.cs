using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using LoveRose.Core.Application.Interfaces;
using LoveRose.Data;
using LoveRose.Data.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LoveRose.API.Configurations;

public static class DependencyInjectionConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // MediatR
        services.AddMediatR(mediatrCfg => 
        {
            mediatrCfg.Using<Mediator>();
        }, Assembly.GetExecutingAssembly());

        // FluentValidation
        services.AddFluentValidationAutoValidation();
        services.AddFluentValidationClientsideAdapters();
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Repository Pattern
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // Payment Services
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IPaymentService, SegpayService>();

        return services;
    }

    public static IServiceCollection AddApiConfiguration(this IServiceCollection services)
    {
        services.AddControllers()
            .AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            });

        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

        return services;
    }

    public static IServiceCollection AddPaymentConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var segpayConfig = new SegpayConfig();
        configuration.GetSection("Segpay").Bind(segpayConfig);
        segpayConfig.Validate();
        services.AddSingleton(segpayConfig);

        services.AddHttpClient<IPaymentService, SegpayService>(client =>
        {
            client.BaseAddress = new Uri(segpayConfig.BaseUrl);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        });

        return services;
    }
}
