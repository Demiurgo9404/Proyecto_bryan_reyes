using LoveRose.Core.Interfaces;
using LoveRose.Infrastructure.Data;
using LoveRose.Infrastructure.Repositories;
using LoveRose.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace LoveRose.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Configure database
            services.Configure<DatabaseConfig>(configuration.GetSection("Database"));
            
            // Register DbContext
            services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            {
                var dbConfig = configuration.GetSection("Database").Get<DatabaseConfig>();
                
                if (dbConfig.UseInMemoryDatabase)
                {
                    options.UseInMemoryDatabase("LoveRoseDb");
                }
                else
                {
                    options.UseNpgsql(
                        dbConfig.ConnectionString,
                        sqlOptions =>
                        {
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: dbConfig.MaxRetryCount,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorCodesToAdd: null);
                            sqlOptions.CommandTimeout(dbConfig.CommandTimeout);
                        });
                }

                if (dbConfig.EnableSensitiveDataLogging)
                {
                    options.EnableSensitiveDataLogging();
                }

                if (dbConfig.EnableDetailedErrors)
                {
                    options.EnableDetailedErrors();
                }
            });

            // Register repositories
            services.AddScoped(typeof(IAsyncRepository<>), typeof(BaseRepository<>));
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<IMediaRepository, MediaRepository>();

            // Register services
            services.AddScoped<ITokenService, JwtTokenService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IFileStorageService, FileStorageService>();
            
            // Register background services if needed
            // services.AddHostedService<BackgroundWorkerService>();

            return services;
        }
    }
}
