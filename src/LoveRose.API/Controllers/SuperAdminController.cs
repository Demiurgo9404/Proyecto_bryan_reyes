using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoveRose.Core.Application.DTOs.Auth;
using LoveRose.Core.Services;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<SuperAdminController> _logger;

    public SuperAdminController(
        IAuthService authService,
        ILogger<SuperAdminController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        try
        {
            // SuperAdmin dashboard data - system-wide metrics
            var dashboardData = new
            {
                totalUsers = await GetTotalUsersAsync(),
                totalAdmins = await GetUsersByRoleAsync("Admin"),
                totalModels = await GetUsersByRoleAsync("Model"),
                totalStudies = await GetUsersByRoleAsync("Study"),
                systemHealth = await GetSystemHealthAsync(),
                recentActivity = await GetRecentSystemActivityAsync()
            };

            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener dashboard de SuperAdmin");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuarios");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("promote-admin")]
    public async Task<IActionResult> PromoteToAdmin([FromBody] AssignRoleDto model)
    {
        try
        {
            var success = await _authService.AssignRoleAsync(model.UserId, Core.Enums.UserRole.Admin);
            
            if (!success)
                return BadRequest(new { message = "No se pudo promover el usuario a Admin" });

            _logger.LogInformation("Usuario {UserId} promovido a Admin por SuperAdmin", model.UserId);
            return Ok(new { message = "Usuario promovido a Admin correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al promover usuario a Admin");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        try
        {
            var success = await _authService.DeleteUserAsync(userId);
            
            if (!success)
                return BadRequest(new { message = "No se pudo eliminar el usuario" });

            _logger.LogInformation("Usuario {UserId} eliminado por SuperAdmin", userId);
            return Ok(new { message = "Usuario eliminado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // Helper methods (these would be implemented in the service layer)
    private async Task<int> GetTotalUsersAsync()
    {
        // Implementation would call service layer
        return await Task.FromResult(0);
    }

    private async Task<int> GetUsersByRoleAsync(string role)
    {
        // Implementation would call service layer
        return await Task.FromResult(0);
    }

    private async Task<object> GetSystemHealthAsync()
    {
        // Implementation would call service layer
        return await Task.FromResult(new { status = "healthy" });
    }

    private async Task<object> GetRecentSystemActivityAsync()
    {
        // Implementation would call service layer
        return await Task.FromResult(new { activities = new List<object>() });
    }
}
