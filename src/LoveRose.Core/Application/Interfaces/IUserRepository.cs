using LoveRose.Core.Domain.Entities;

namespace LoveRose.Core.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailInUseAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> IsUsernameInUseAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> UpdateLastLoginAsync(string userId, DateTime loginTime, CancellationToken cancellationToken = default);
    Task<bool> UpdateProfileImageAsync(string userId, string imageUrl, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(string userId, string newPasswordHash, CancellationToken cancellationToken = default);
}
