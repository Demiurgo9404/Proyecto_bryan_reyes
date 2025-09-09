using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LoveRose.Core.Dtos.Auth;
using LoveRose.Core.Entities;
using LoveRose.Core.Enums;
using LoveRose.Core.Interfaces.Repositories;
using LoveRose.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace LoveRose.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ITokenService tokenService,
            IUserRepository userRepository,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AuthResponse> LoginAsync(AuthRequest request, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed for email: {Email}. User not found.", request.Email);
                return new AuthResponse { Error = "Invalid credentials" };
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed for user {UserId}. Invalid password.", user.Id);
                return new AuthResponse { Error = "Invalid credentials" };
            }

            if (!user.EmailConfirmed)
            {
                _logger.LogWarning("Login failed for user {UserId}. Email not confirmed.", user.Id);
                return new AuthResponse { Error = "Email not confirmed" };
            }

            var roles = await _userManager.GetRolesAsync(user);
            
            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _tokenService.SaveRefreshTokenAsync(user.Id.ToString(), refreshToken, refreshTokenExpiry);
            
            _logger.LogInformation("User {UserId} logged in from {IpAddress}", user.Id, ipAddress);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiration = DateTime.UtcNow.AddMinutes(60), // Should match token expiration
                UserId = user.Id.ToString(),
                Email = user.Email,
                Username = user.UserName,
                FullName = $"{user.FirstName} {user.LastName}",
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList(),
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
        {
            if (await _userManager.FindByEmailAsync(request.Email) != null)
            {
                return new AuthResponse { Error = "Email is already taken" };
            }

            if (await _userRepository.IsUsernameTakenAsync(request.Username))
            {
                return new AuthResponse { Error = "Username is already taken" };
            }

            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                LastActive = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Error = "User creation failed",
                    Errors = result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description })
                };
            }

            // Add user to default role (e.g., "User")
            await _userManager.AddToRoleAsync(user, "User");

            // Generate email confirmation token
            var emailConfirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            
            // In a real app, you would send an email with this token
            await _emailService.SendEmailConfirmationAsync(user.Email, user.Id, emailConfirmationToken);

            _logger.LogInformation("New user registered: {UserId} from {IpAddress}", user.Id, ipAddress);

            // Log the user in after registration
            return await LoginAsync(new AuthRequest
            {
                Email = request.Email,
                Password = request.Password
            }, ipAddress);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress)
        {
            var principal = _tokenService.GetPrincipalFromToken(request.AccessToken);
            if (principal == null)
            {
                return new AuthResponse { Error = "Invalid token" };
            }

            var userId = principal.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
            var user = await _userManager.FindByIdAsync(userId);
            
            if (user == null)
            {
                return new AuthResponse { Error = "User not found" };
            }

            var isValid = await _tokenService.ValidateRefreshTokenAsync(userId, request.RefreshToken);
            if (!isValid)
            {
                return new AuthResponse { Error = "Invalid refresh token" };
            }

            // Revoke the old refresh token
            await _tokenService.RevokeRefreshTokenAsync(userId);

            // Generate new tokens
            var roles = await _userManager.GetRolesAsync(user);
            var newAccessToken = _tokenService.GenerateAccessToken(user, roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _tokenService.SaveRefreshTokenAsync(userId, newRefreshToken, refreshTokenExpiry);

            _logger.LogInformation("Token refreshed for user {UserId} from {IpAddress}", user.Id, ipAddress);

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                AccessTokenExpiration = DateTime.UtcNow.AddMinutes(60), // Should match token expiration
                UserId = user.Id.ToString(),
                Email = user.Email,
                Username = user.UserName,
                FullName = $"{user.FirstName} {user.LastName}",
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList(),
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<bool> RevokeTokenAsync(string refreshToken, string ipAddress)
        {
            var userId = await _tokenService.GetUserIdFromTokenAsync(refreshToken);
            if (string.IsNullOrEmpty(userId))
            {
                return false;
            }

            await _tokenService.RevokeRefreshTokenAsync(userId);
            _logger.LogInformation("Token revoked for user {UserId} from {IpAddress}", userId, ipAddress);
            return true;
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return false;
            }

            await _tokenService.RevokeRefreshTokenAsync(userId);
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User {UserId} logged out", userId);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (result.Succeeded)
            {
                _logger.LogInformation("Password reset for user {UserId}", user.Id);
                return true;
            }

            _logger.LogWarning("Password reset failed for user {UserId}. Errors: {Errors}", 
                user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return false;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                // Don't reveal that the user does not exist or is not confirmed
                return true;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // In a real app, you would send an email with this token
            await _emailService.SendPasswordResetEmailAsync(email, user.Id, token);
            
            _logger.LogInformation("Password reset requested for user {UserId}", user.Id);
            return true;
        }

        public async Task<bool> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                _logger.LogInformation("Email confirmed for user {UserId}", user.Id);
                return true;
            }

            _logger.LogWarning("Email confirmation failed for user {UserId}. Errors: {Errors}", 
                user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return false;
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (result.Succeeded)
            {
                _logger.LogInformation("Password changed for user {UserId}", user.Id);
                return true;
            }

            _logger.LogWarning("Password change failed for user {UserId}. Errors: {Errors}", 
                user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return false;
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user == null;
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            return !await _userRepository.IsUsernameTakenAsync(username);
        }
    }
}
