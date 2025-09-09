using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Entities.Identity;
using LoveRose.Core.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Infrastructure.Repositories
{
    public class RoleRepository : BaseRepository<Role>, IRoleRepository
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public RoleRepository(
            ApplicationDbContext dbContext,
            RoleManager<Role> roleManager,
            UserManager<ApplicationUser> userManager)
            : base(dbContext)
        {
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        }

        public async Task<Role> FindByNameAsync(string roleName)
        {
            return await _roleManager.FindByNameAsync(roleName);
        }

        public async Task<Role> FindByIdAsync(int roleId)
        {
            return await _roleManager.FindByIdAsync(roleId.ToString());
        }

        public async Task<bool> RoleExistsAsync(string roleName)
        {
            return await _roleManager.RoleExistsAsync(roleName);
        }

        public async Task<IdentityResult> CreateRoleAsync(Role role)
        {
            return await _roleManager.CreateAsync(role);
        }

        public async Task<IdentityResult> UpdateRoleAsync(Role role)
        {
            return await _roleManager.UpdateAsync(role);
        }

        public async Task<IdentityResult> DeleteRoleAsync(Role role)
        {
            return await _roleManager.DeleteAsync(role);
        }

        public async Task<IList<ApplicationUser>> GetUsersInRoleAsync(string roleName)
        {
            return await _userManager.GetUsersInRoleAsync(roleName);
        }

        public async Task<IList<string>> GetUserRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<bool> IsUserInRoleAsync(ApplicationUser user, string roleName)
        {
            return await _userManager.IsInRoleAsync(user, roleName);
        }

        public async Task<IdentityResult> AddUserToRoleAsync(ApplicationUser user, string roleName)
        {
            return await _userManager.AddToRoleAsync(user, roleName);
        }

        public async Task<IdentityResult> RemoveUserFromRoleAsync(ApplicationUser user, string roleName)
        {
            return await _userManager.RemoveFromRoleAsync(user, roleName);
        }

        public async Task<IList<Role>> GetAllRolesAsync()
        {
            return await _roleManager.Roles.ToListAsync();
        }

        public async Task<Role> GetRoleWithUsersAsync(int roleId)
        {
            return await _dbContext.Roles
                .Include(r => r.UserRoles)
                .ThenInclude(ur => ur.User)
                .FirstOrDefaultAsync(r => r.Id == roleId);
        }

        public async Task<Role> GetRoleWithClaimsAsync(int roleId)
        {
            return await _dbContext.Roles
                .Include(r => r.RoleClaims)
                .FirstOrDefaultAsync(r => r.Id == roleId);
        }

        public async Task<IdentityResult> AddClaimToRoleAsync(Role role, string claimType, string claimValue)
        {
            var claim = new Claim(claimType, claimValue);
            return await _roleManager.AddClaimAsync(role, claim);
        }

        public async Task<IdentityResult> RemoveClaimFromRoleAsync(Role role, string claimType, string claimValue)
        {
            var claims = await _roleManager.GetClaimsAsync(role);
            var claim = claims.FirstOrDefault(c => c.Type == claimType && c.Value == claimValue);
            
            if (claim != null)
            {
                return await _roleManager.RemoveClaimAsync(role, claim);
            }
            
            return IdentityResult.Success;
        }

        public async Task<IList<IdentityRoleClaim<int>>> GetRoleClaimsAsync(int roleId)
        {
            return await _dbContext.RoleClaims
                .Where(rc => rc.RoleId == roleId)
                .ToListAsync();
        }
    }
}
