using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Model,Admin,SuperAdmin")]
public class ModelController : ControllerBase
{
    private readonly ILogger<ModelController> _logger;

    public ModelController(ILogger<ModelController> logger)
    {
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var dashboardData = new
            {
                profile = await GetModelProfileAsync(userId),
                earnings = await GetModelEarningsAsync(userId),
                activeConnections = await GetActiveConnectionsAsync(userId),
                scheduledSessions = await GetScheduledSessionsAsync(userId),
                ratings = await GetModelRatingsAsync(userId),
                recentActivity = await GetRecentActivityAsync(userId)
            };

            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener dashboard de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var profile = await GetModelProfileAsync(userId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateModelProfileDto model)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await UpdateModelProfileAsync(userId, model);
            
            if (!success)
                return BadRequest(new { message = "No se pudo actualizar el perfil" });

            return Ok(new { message = "Perfil actualizado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar perfil de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("earnings")]
    public async Task<IActionResult> GetEarnings([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var earnings = await GetModelEarningsDetailedAsync(userId, from, to);
            return Ok(earnings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener ganancias de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions([FromQuery] string? status = null)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var sessions = await GetModelSessionsAsync(userId, status);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener sesiones de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("availability")]
    public async Task<IActionResult> SetAvailability([FromBody] SetAvailabilityDto model)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await SetModelAvailabilityAsync(userId, model);
            
            if (!success)
                return BadRequest(new { message = "No se pudo actualizar la disponibilidad" });

            return Ok(new { message = "Disponibilidad actualizada correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar disponibilidad de Model");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // Helper methods (would be implemented in service layer)
    private async Task<object> GetModelProfileAsync(string userId)
    {
        return await Task.FromResult(new { userId, name = "Model Profile" });
    }

    private async Task<object> GetModelEarningsAsync(string userId)
    {
        return await Task.FromResult(new { totalEarnings = 0m, thisMonth = 0m });
    }

    private async Task<int> GetActiveConnectionsAsync(string userId)
    {
        return await Task.FromResult(0);
    }

    private async Task<object> GetScheduledSessionsAsync(string userId)
    {
        return await Task.FromResult(new { sessions = new List<object>() });
    }

    private async Task<object> GetModelRatingsAsync(string userId)
    {
        return await Task.FromResult(new { averageRating = 0.0, totalRatings = 0 });
    }

    private async Task<object> GetRecentActivityAsync(string userId)
    {
        return await Task.FromResult(new { activities = new List<object>() });
    }

    private async Task<bool> UpdateModelProfileAsync(string userId, UpdateModelProfileDto model)
    {
        return await Task.FromResult(true);
    }

    private async Task<object> GetModelEarningsDetailedAsync(string userId, DateTime? from, DateTime? to)
    {
        return await Task.FromResult(new { earnings = new List<object>() });
    }

    private async Task<object> GetModelSessionsAsync(string userId, string status)
    {
        return await Task.FromResult(new { sessions = new List<object>() });
    }

    private async Task<bool> SetModelAvailabilityAsync(string userId, SetAvailabilityDto model)
    {
        return await Task.FromResult(true);
    }
}

public class UpdateModelProfileDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public decimal HourlyRate { get; set; }
}

public class SetAvailabilityDto
{
    public bool IsAvailable { get; set; }
    public List<AvailabilitySlot> Slots { get; set; } = new();
}

public class AvailabilitySlot
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
