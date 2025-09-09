using LoveRose.Core.Entities;
using LoveRose.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LoveRose.Infrastructure.Data
{
    public static class SeedDataInitializer
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();
            var context = services.GetRequiredService<ApplicationDbContext>();
            var userManager = services.GetRequiredService<UserManager<User>>();
            var roleManager = services.GetRequiredService<RoleManager<Role>>();

            try
            {
                logger.LogInformation("Starting database migration...");
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migration completed successfully");

                await SeedRolesAsync(roleManager);
                await SeedUsersAsync(userManager);
                await SeedPostsAsync(context, userManager);
                
                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }

        private static async Task SeedRolesAsync(RoleManager<Role> roleManager)
        {
            string[] roleNames = { "Admin", "Moderator", "User", "PremiumUser" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new Role(roleName)
                    {
                        Description = $"{roleName} role",
                        IsSystemRole = roleName == "Admin" || roleName == "User"
                    });
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<User> userManager)
        {
            // Admin User
            var adminEmail = "admin@loverose.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Test Users
            var testUsers = new[]
            {
                new { Username = "johndoe", Email = "john@example.com", FirstName = "John", LastName = "Doe" },
                new { Username = "janesmith", Email = "jane@example.com", FirstName = "Jane", LastName = "Smith" },
                new { Username = "bobwilson", Email = "bob@example.com", FirstName = "Bob", LastName = "Wilson" }
            };

            foreach (var userInfo in testUsers)
            {
                var user = await userManager.FindByEmailAsync(userInfo.Email);
                if (user == null)
                {
                    user = new User
                    {
                        UserName = userInfo.Username,
                        Email = userInfo.Email,
                        FirstName = userInfo.FirstName,
                        LastName = userInfo.LastName,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(user, "Test@123");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, "User");
                    }
                }
            }
        }

        private static async Task SeedPostsAsync(ApplicationDbContext context, UserManager<User> userManager)
        {
            if (await context.Posts.AnyAsync())
                return;

            var users = await userManager.Users.Take(3).ToListAsync();
            if (users.Count < 2)
                return;

            var posts = new List<Post>();
            var random = new Random();
            var now = DateTime.UtcNow;

            // Create sample posts
            for (int i = 0; i < 10; i++)
            {
                var user = users[random.Next(users.Count)];
                var post = new Post
                {
                    Content = $"This is a sample post #{i + 1} by {user.UserName}",
                    UserId = user.Id,
                    CreatedAt = now.AddHours(-i),
                    LikeCount = random.Next(0, 50),
                    CommentCount = random.Next(0, 20),
                    ShareCount = random.Next(0, 10),
                    IsEdited = random.Next(0, 10) > 7,
                    IsPinned = i % 5 == 0,
                    Visibility = PostVisibility.Public,
                    Media = new List<PostMedia>
                    {
                        new PostMedia
                        {
                            MediaUrl = $"https://picsum.photos/800/600?random={i}",
                            MediaType = MediaType.Image,
                            Position = 0,
                            Width = 800,
                            Height = 600
                        }
                    }
                };

                posts.Add(post);
            }

            await context.Posts.AddRangeAsync(posts);
            await context.SaveChangesAsync();
        }
    }

    public static class SeedDataExtensions
    {
        public static IHost SeedData(this IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();
            
            try
            {
                logger.LogInformation("Starting database seeding...");
                var task = SeedDataInitializer.Initialize(services);
                task.Wait();
                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }

            return host;
        }
    }
}
