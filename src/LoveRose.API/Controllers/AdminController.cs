using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoveRose.Core.Application.DTOs.Auth;
using LoveRose.Core.Services;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IAuthService authService,
        ILogger<AdminController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        try
        {
            var dashboardData = new
            {
                totalUsers = await GetTotalUsersAsync(),
                totalModels = await GetUsersByRoleAsync("Model"),
                totalStudies = await GetUsersByRoleAsync("Study"),
                activeConnections = await GetActiveConnectionsAsync(),
                recentTransactions = await GetRecentTransactionsAsync(),
                monthlyRevenue = await GetMonthlyRevenueAsync()
            };

            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener dashboard de Admin");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role = null)
    {
        try
        {
            var users = string.IsNullOrEmpty(role) 
                ? await _authService.GetAllUsersAsync()
                : await _authService.GetUsersByRoleAsync(role);
            
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuarios");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto model)
    {
        try
        {
            // Admin can only assign User, Model, Study roles
            if (model.Role == Core.Enums.UserRole.Admin || model.Role == Core.Enums.UserRole.SuperAdmin)
            {
                return Forbid("No tienes permisos para asignar este rol");
            }

            var success = await _authService.AssignRoleAsync(model.UserId, model.Role);
            
            if (!success)
                return BadRequest(new { message = "No se pudo asignar el rol al usuario" });

            _logger.LogInformation("Rol {Role} asignado al usuario {UserId} por Admin", model.Role, model.UserId);
            return Ok(new { message = "Rol asignado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al asignar rol");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateUserStatusDto model)
    {
        try
        {
            var success = await _authService.UpdateUserStatusAsync(userId, model.IsActive);
            
            if (!success)
                return BadRequest(new { message = "No se pudo actualizar el estado del usuario" });

            _logger.LogInformation("Estado del usuario {UserId} actualizado a {Status} por Admin", userId, model.IsActive);
            return Ok(new { message = "Estado del usuario actualizado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar estado del usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("reports/users")]
    public async Task<IActionResult> GetUserReport()
    {
        try
        {
            var report = await GenerateUserReportAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar reporte de usuarios");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // Helper methods
    private async Task<int> GetTotalUsersAsync()
    {
        return await Task.FromResult(0);
    }

    private async Task<int> GetUsersByRoleAsync(string role)
    {
        return await Task.FromResult(0);
    }

    private async Task<int> GetActiveConnectionsAsync()
    {
        return await Task.FromResult(0);
    }

    private async Task<object> GetRecentTransactionsAsync()
    {
        return await Task.FromResult(new { transactions = new List<object>() });
    }

    private async Task<decimal> GetMonthlyRevenueAsync()
    {
        return await Task.FromResult(0m);
    }

    private async Task<object> GenerateUserReportAsync()
    {
        return await Task.FromResult(new { report = "User report data" });
    }
}

public class UpdateUserStatusDto
{
    public bool IsActive { get; set; }
}
