using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LoveRose.Core.Domain.Entities.Identity;
using LoveRose.Core.Domain.Interfaces;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
        Task<Role?> GetByNormalizedNameAsync(string normalizedName, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Role>> GetRolesForUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<bool> RoleExistsAsync(string roleName, CancellationToken cancellationToken = default);
    }
}
