using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LoveRose.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace LoveRose.Infrastructure.Data
{
    public static class ApplicationDbInitializer
    {
        public static async Task SeedRolesAsync(RoleManager<Role> roleManager)
        {
            if (roleManager.Roles.Any()) return;

            var roles = new List<Role>
            {
                new Role { Name = "Admin", Description = "Administrator with full access", IsSystemRole = true },
                new Role { Name = "User", Description = "Standard user", IsSystemRole = true },
                new Role { Name = "Moderator", Description = "Moderator with elevated permissions", IsSystemRole = true },
                new Role { Name = "ContentCreator", Description = "Content creator with publishing rights", IsSystemRole = true }
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name))
                {
                    await roleManager.CreateAsync(role);
                }
            }
        }

        public static async Task SeedAdminUserAsync(UserManager<User> userManager, IConfiguration configuration)
        {
            var adminEmail = configuration["AdminUser:Email"] ?? "admin@loverose.com";
            var adminUserName = configuration["AdminUser:Username"] ?? "admin";
            var adminPassword = configuration["AdminUser:Password"] ?? "Admin@123";
            var adminFirstName = configuration["AdminUser:FirstName"] ?? "Admin";
            var adminLastName = configuration["AdminUser:LastName"] ?? "User";

            if (await userManager.FindByEmailAsync(adminEmail) != null) return;

            var adminUser = new User
            {
                UserName = adminUserName,
                Email = adminEmail,
                FirstName = adminFirstName,
                LastName = adminLastName,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastActive = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
                
                    // Optionally add other roles if needed
                await userManager.AddToRoleAsync(adminUser, "Moderator");
                await userManager.AddToRoleAsync(adminUser, "ContentCreator");
            }
        }
    }
}
