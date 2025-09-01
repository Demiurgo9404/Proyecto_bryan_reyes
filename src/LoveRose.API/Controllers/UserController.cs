using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User,Model,Study,Admin,SuperAdmin")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;

    public UserController(ILogger<UserController> logger)
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
                profile = await GetUserProfileAsync(userId),
                balance = await GetUserBalanceAsync(userId),
                recentTransactions = await GetRecentTransactionsAsync(userId),
                favoriteModels = await GetFavoriteModelsAsync(userId),
                upcomingSessions = await GetUpcomingSessionsAsync(userId),
                notifications = await GetNotificationsAsync(userId)
            };

            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener dashboard de User");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var profile = await GetUserProfileAsync(userId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil de usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto model)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await UpdateUserProfileAsync(userId, model);
            
            if (!success)
                return BadRequest(new { message = "No se pudo actualizar el perfil" });

            return Ok(new { message = "Perfil actualizado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar perfil de usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var balance = await GetUserBalanceAsync(userId);
            return Ok(balance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener balance del usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var transactions = await GetUserTransactionsAsync(userId, page, pageSize);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener transacciones del usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("models")]
    public async Task<IActionResult> GetAvailableModels([FromQuery] string? search = null, [FromQuery] string? category = null)
    {
        try
        {
            var models = await GetAvailableModelsAsync(search, category);
            return Ok(models);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener modelos disponibles");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("favorites/{modelId}")]
    public async Task<IActionResult> AddToFavorites(string modelId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await AddToFavoritesAsync(userId, modelId);
            
            if (!success)
                return BadRequest(new { message = "No se pudo agregar a favoritos" });

            return Ok(new { message = "Agregado a favoritos correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al agregar a favoritos");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpDelete("favorites/{modelId}")]
    public async Task<IActionResult> RemoveFromFavorites(string modelId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await RemoveFromFavoritesAsync(userId, modelId);
            
            if (!success)
                return BadRequest(new { message = "No se pudo remover de favoritos" });

            return Ok(new { message = "Removido de favoritos correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al remover de favoritos");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpPost("sessions/request")]
    public async Task<IActionResult> RequestSession([FromBody] SessionRequestDto model)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var sessionId = await RequestSessionAsync(userId, model);
            
            if (string.IsNullOrEmpty(sessionId))
                return BadRequest(new { message = "No se pudo solicitar la sesión" });

            return Ok(new { message = "Sesión solicitada correctamente", sessionId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al solicitar sesión");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions([FromQuery] string? status = null)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var sessions = await GetUserSessionsAsync(userId, status);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener sesiones del usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // Helper methods (would be implemented in service layer)
    private async Task<object> GetUserProfileAsync(string userId)
    {
        return await Task.FromResult(new { userId, name = "User Profile" });
    }

    private async Task<object> GetUserBalanceAsync(string userId)
    {
        return await Task.FromResult(new { balance = 0m, currency = "USD" });
    }

    private async Task<object> GetRecentTransactionsAsync(string userId)
    {
        return await Task.FromResult(new { transactions = new List<object>() });
    }

    private async Task<object> GetFavoriteModelsAsync(string userId)
    {
        return await Task.FromResult(new { models = new List<object>() });
    }

    private async Task<object> GetUpcomingSessionsAsync(string userId)
    {
        return await Task.FromResult(new { sessions = new List<object>() });
    }

    private async Task<object> GetNotificationsAsync(string userId)
    {
        return await Task.FromResult(new { notifications = new List<object>() });
    }

    private async Task<bool> UpdateUserProfileAsync(string userId, UpdateUserProfileDto model)
    {
        return await Task.FromResult(true);
    }

    private async Task<object> GetUserTransactionsAsync(string userId, int page, int pageSize)
    {
        return await Task.FromResult(new { transactions = new List<object>(), totalPages = 1 });
    }

    private async Task<object> GetAvailableModelsAsync(string search, string category)
    {
        return await Task.FromResult(new { models = new List<object>() });
    }

    private async Task<bool> AddToFavoritesAsync(string userId, string modelId)
    {
        return await Task.FromResult(true);
    }

    private async Task<bool> RemoveFromFavoritesAsync(string userId, string modelId)
    {
        return await Task.FromResult(true);
    }

    private async Task<string> RequestSessionAsync(string userId, SessionRequestDto model)
    {
        return await Task.FromResult(Guid.NewGuid().ToString());
    }

    private async Task<object> GetUserSessionsAsync(string userId, string status)
    {
        return await Task.FromResult(new { sessions = new List<object>() });
    }
}

public class UpdateUserProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = new();
}

public class SessionRequestDto
{
    public string ModelId { get; set; } = string.Empty;
    public DateTime PreferredDateTime { get; set; }
    public int DurationMinutes { get; set; }
    public string SessionType { get; set; } = string.Empty; // video, chat, etc.
    public string Message { get; set; } = string.Empty;
}
