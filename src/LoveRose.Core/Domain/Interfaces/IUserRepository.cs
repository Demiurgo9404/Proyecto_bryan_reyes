using LoveRose.Core.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IUserRepository : IAsyncRepository<ApplicationUser>
    {
        Task<ApplicationUser> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<ApplicationUser> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
        Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default);
        Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password);
        Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);
        Task<IList<string>> GetUserRolesAsync(ApplicationUser user);
        Task<ApplicationUser> FindByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<string> GenerateEmailConfirmationTokenAsync(ApplicationUser user);
        Task<IdentityResult> ConfirmEmailAsync(ApplicationUser user, string token);
        Task<string> GeneratePasswordResetTokenAsync(ApplicationUser user);
        Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string token, string newPassword);
        Task<ApplicationUser> FindByIdAsync(string userId);
        Task<IdentityResult> UpdateUserAsync(ApplicationUser user);
        Task<IdentityResult> DeleteUserAsync(ApplicationUser user);
        Task<IList<ApplicationUser>> GetUsersInRoleAsync(string roleName);
        Task<bool> IsInRoleAsync(ApplicationUser user, string roleName);
        Task<IdentityResult> RemoveFromRoleAsync(ApplicationUser user, string roleName);
        Task<IdentityResult> AddToRolesAsync(ApplicationUser user, IEnumerable<string> roles);
        Task<IList<ApplicationUser>> GetUsersWithRolesAsync();
        Task<ApplicationUser> GetUserWithRolesAsync(int userId);
    }
}
