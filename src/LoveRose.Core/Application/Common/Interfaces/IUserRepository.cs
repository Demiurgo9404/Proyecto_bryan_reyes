using LoveRose.Core.Domain.Entities;

namespace LoveRose.Core.Application.Common.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailUniqueAsync(string email, string? excludeUserId = null, CancellationToken cancellationToken = default);
    Task<bool> IsUsernameUniqueAsync(string username, string? excludeUserId = null, CancellationToken cancellationToken = default);
    Task<bool> IsUserActiveAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> SearchUsersAsync(string searchTerm, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetUsersByRoleAsync(string role, CancellationToken cancellationToken = default);
    Task<bool> UpdateLastLoginAsync(string userId, DateTime loginTime, CancellationToken cancellationToken = default);
    Task<bool> UpdateProfileImageAsync(string userId, string imageUrl, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(string userId, string newPasswordHash, CancellationToken cancellationToken = default);
}
