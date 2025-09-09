using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using LoveRose.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace LoveRose.API.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtMiddleware> _logger;

        public JwtMiddleware(
            RequestDelegate next,
            IConfiguration configuration,
            ILogger<JwtMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context, ITokenService tokenService)
        {
            var token = ExtractTokenFromRequest(context.Request);
            
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    var jwtToken = (JwtSecurityToken)validatedToken;
                    var userId = jwtToken.Claims.First(x => x.Type == "sub" || x.Type == ClaimTypes.NameIdentifier).Value;

                    // Attach user to context on successful JWT validation
                    if (!string.IsNullOrEmpty(userId))
                    {
                        context.Items["UserId"] = userId;
                        var roles = jwtToken.Claims
                            .Where(c => c.Type == "role" || c.Type == ClaimTypes.Role)
                            .Select(c => c.Value)
                            .ToList();
                        
                        if (roles.Any())
                        {
                            context.Items["UserRoles"] = roles;
                        }
                    }
                }
                catch (SecurityTokenExpiredException ex)
                {
                    _logger.LogWarning(ex, "JWT token expired");
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                catch (SecurityTokenValidationException ex)
                {
                    _logger.LogWarning(ex, "Invalid JWT token");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error validating JWT token");
                }
            }

            await _next(context);
        }

        private string ExtractTokenFromRequest(HttpRequest request)
        {
            // Try to get token from Authorization header
            if (request.Headers.TryGetValue("Authorization", out var authHeader) && 
                !string.IsNullOrEmpty(authHeader) &&
                authHeader.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return authHeader.ToString().Substring("Bearer ".Length).Trim();
            }

            // Try to get token from query string
            if (request.Query.TryGetValue("access_token", out var accessToken) && 
                !string.IsNullOrEmpty(accessToken))
            {
                return accessToken;
            }

            // Try to get token from cookie
            if (request.Cookies.TryGetValue("access_token", out var cookieToken) && 
                !string.IsNullOrEmpty(cookieToken))
            {
                return cookieToken;
            }

            return null;
        }
    }
}
