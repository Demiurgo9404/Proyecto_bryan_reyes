using System.Security.Claims;
using LoveRose.Core.Enums;
using LoveRose.Core.Application.DTOs.Auth;
using LoveRose.Core.Models;
using LoveRose.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        try
        {
            var (success, token, refreshToken, error, user) = await _authService.LoginAsync(model.Email, model.Password);
            
            if (!success)
                return Unauthorized(new { message = error });

            return Ok(new 
            { 
                token, 
                refreshToken,
                user = new 
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    roles = await _authService.GetUserRolesAsync(user.Id)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el inicio de sesión");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("refresh-token")]
    [Route("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto request)
    {
        try
        {
            var (success, token, refreshToken, error) = await _authService.RefreshTokenAsync(
                request.Token, 
                request.RefreshToken);

            if (!success)
                return BadRequest(new { message = error });

            return Ok(new { token, refreshToken });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al refrescar el token");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("assign-role")]
    [Route("assign-role")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto model)
    {
        try
        {
            var success = await _authService.AssignRoleAsync(model.UserId, model.Role);
            
            if (!success)
                return BadRequest(new { message = "No se pudo asignar el rol al usuario" });

            return Ok(new { message = "Rol asignado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al asignar rol");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [Authorize]
    [HttpGet("me")]
    [Route("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _authService.GetUserAsync(userId);
            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var roles = await _authService.GetUserRolesAsync(userId);

            return Ok(new 
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                roles = roles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el usuario actual");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        try
        {
            var user = new User
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _authService.RegisterAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Asignar rol por defecto
            await _authService.AssignRoleAsync(user.Id, UserRole.User);

            _logger.LogInformation("Usuario registrado exitosamente: {Email}", model.Email);
            return Ok(new { message = "Usuario registrado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
