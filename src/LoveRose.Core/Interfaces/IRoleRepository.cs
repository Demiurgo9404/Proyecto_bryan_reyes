using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Entities.Identity;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IRoleRepository : IAsyncRepository<Role>
    {
        Task<Role?> FindByNameAsync(string roleName, CancellationToken cancellationToken = default);
        Task<Role?> FindByIdAsync(int roleId, CancellationToken cancellationToken = default);
        Task<bool> RoleExistsAsync(string roleName, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Role>> GetRolesForUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ApplicationUser>> GetUsersInRoleAsync(string roleName, CancellationToken cancellationToken = default);
        Task<int> CountUsersInRoleAsync(string roleName, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Role>> GetRolesWithUsersAsync(CancellationToken cancellationToken = default);
        Task<Role?> GetRoleWithUsersAsync(int roleId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RoleClaim>> GetRoleClaimsAsync(int roleId, CancellationToken cancellationToken = default);
        Task AddClaimToRoleAsync(Role role, string claimType, string claimValue, CancellationToken cancellationToken = default);
        Task RemoveClaimFromRoleAsync(Role role, string claimType, string claimValue, CancellationToken cancellationToken = default);
        Task<bool> IsUserInRoleAsync(int userId, string roleName, CancellationToken cancellationToken = default);
    }
}
