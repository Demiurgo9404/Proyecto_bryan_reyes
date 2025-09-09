using System.Threading.Tasks;
using LoveRose.Core.Dtos.Auth;
using LoveRose.Core.Domain.Entities;

namespace LoveRose.Core.Domain.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(AuthRequest request, string ipAddress);
        Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress);
        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress);
        Task<bool> RevokeTokenAsync(string refreshToken, string ipAddress);
        Task<bool> LogoutAsync(string userId);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ConfirmEmailAsync(string userId, string token);
        Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> IsUsernameAvailableAsync(string username);
    }
}
