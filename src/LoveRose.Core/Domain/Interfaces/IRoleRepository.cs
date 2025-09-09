using LoveRose.Core.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IRoleRepository : IAsyncRepository<Role>
    {
        Task<Role> FindByNameAsync(string roleName);
        Task<Role> FindByIdAsync(int roleId);
        Task<bool> RoleExistsAsync(string roleName);
        Task<IdentityResult> CreateRoleAsync(Role role);
        Task<IdentityResult> UpdateRoleAsync(Role role);
        Task<IdentityResult> DeleteRoleAsync(Role role);
        Task<IList<ApplicationUser>> GetUsersInRoleAsync(string roleName);
        Task<IList<string>> GetUserRolesAsync(ApplicationUser user);
        Task<bool> IsUserInRoleAsync(ApplicationUser user, string roleName);
        Task<IdentityResult> AddUserToRoleAsync(ApplicationUser user, string roleName);
        Task<IdentityResult> RemoveUserFromRoleAsync(ApplicationUser user, string roleName);
        Task<IList<Role>> GetAllRolesAsync();
        Task<Role> GetRoleWithUsersAsync(int roleId);
        Task<Role> GetRoleWithClaimsAsync(int roleId);
        Task<IdentityResult> AddClaimToRoleAsync(Role role, string claimType, string claimValue);
        Task<IdentityResult> RemoveClaimFromRoleAsync(Role role, string claimType, string claimValue);
        Task<IList<IdentityRoleClaim<int>>> GetRoleClaimsAsync(int roleId);
    }
}
