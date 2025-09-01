using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LoveRose.Core.Enums;
using LoveRose.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LoveRose.Core.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, string? RefreshToken, string? Error, User? User)> 
        LoginAsync(string email, string password);
    
    Task<(bool Success, string? Token, string? RefreshToken, string? Error)>
        RefreshTokenAsync(string token, string refreshToken);
    
    Task<bool> AssignRoleAsync(string userId, UserRole role);
    Task<bool> HasRoleAsync(string userId, UserRole role);
    Task<IList<string>> GetUserRolesAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly TokenValidationParameters _tokenValidationParameters;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        
        _tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    }

    public async Task<(bool Success, string? Token, string? RefreshToken, string? Error, User? User)> 
        LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || !user.IsActive)
            return (false, null, null, "Usuario o contraseña inválidos", null);

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded)
            return (false, null, null, "Usuario o contraseña inválidos", null);

        var token = await GenerateJwtTokenAsync(user);
        var refreshToken = GenerateRefreshToken();
        
        // Guardar el refresh token en el usuario
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 días de validez
        await _userManager.UpdateAsync(user);

        return (true, token, refreshToken, null, user);
    }

    public async Task<(bool Success, string? Token, string? RefreshToken, string? Error)>
        RefreshTokenAsync(string token, string refreshToken)
    {
        var principal = GetPrincipalFromExpiredToken(token);
        if (principal?.Identity?.Name == null)
            return (false, null, null, "Token inválido");

        var user = await _userManager.FindByIdAsync(principal.Identity.Name);
        if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return (false, null, null, "Token de refresco inválido o expirado");

        var newToken = await GenerateJwtTokenAsync(user);
        var newRefreshToken = GenerateRefreshToken();
        
        // Actualizar el refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return (true, newToken, newRefreshToken, null);
    }

    public async Task<bool> AssignRoleAsync(string userId, UserRole role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        // Primero quitamos todos los roles existentes
        var userRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, userRoles);
        
        // Luego agregamos el nuevo rol
        var result = await _userManager.AddToRoleAsync(user, role.ToString());
        return result.Succeeded;
    }

    public async Task<bool> HasRoleAsync(string userId, UserRole role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;
        
        return await _userManager.IsInRoleAsync(user, role.ToString());
    }

    public async Task<IList<string>> GetUserRolesAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user != null ? await _userManager.GetRolesAsync(user) : new List<string>();
    }

    #region Private Methods

    private async Task<string> GenerateJwtTokenAsync(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        // Agregar roles como claims
        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpireMinutes"]));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, _tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, 
                    StringComparison.InvariantCultureIgnoreCase))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }

    #endregion
}
