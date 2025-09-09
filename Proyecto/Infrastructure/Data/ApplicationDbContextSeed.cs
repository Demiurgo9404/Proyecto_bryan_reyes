using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Proyecto.Core.Entities;
using Proyecto.Infrastructure.Identity;

namespace Proyecto.Infrastructure.Data;

public static class ApplicationDbContextSeed
{
    public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Seed roles
        string[] roleNames = { "Admin", "Model", "User" };
        
        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Seed admin user
        var adminEmail = "admin@loverose.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            var admin = new ApplicationUser
            {
                UserName = "admin",
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                IsActive = true,
                IsVerified = true
            };

            var createAdmin = await userManager.CreateAsync(admin, "Admin@123");
            if (createAdmin.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }

        // Seed test model user
        var modelEmail = "model@loverose.com";
        var modelUser = await userManager.FindByEmailAsync(modelEmail);
        
        if (modelUser == null)
        {
            var model = new ApplicationUser
            {
                UserName = "model1",
                Email = modelEmail,
                FirstName = "Model",
                LastName = "User",
                EmailConfirmed = true,
                IsActive = true,
                IsVerified = true
            };

            var createModel = await userManager.CreateAsync(model, "Model@123");
            if (createModel.Succeeded)
            {
                await userManager.AddToRoleAsync(model, "Model");
                
                // Create model profile
                var modelProfile = new ModelProfile
                {
                    UserId = model.Id,
                    DisplayName = "Model User",
                    Bio = "Professional model",
                    IsOnline = false,
                    LastSeen = DateTime.UtcNow,
                    TotalEarnings = 0,
                    TotalSessions = 0,
                    AverageRating = 0,
                    IsVerified = true
                };
                
                // Save model profile to database
                var context = userManager.GetService<ApplicationDbContext>();
                if (context != null)
                {
                    context.ModelProfiles.Add(modelProfile);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
