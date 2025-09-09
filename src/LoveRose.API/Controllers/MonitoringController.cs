using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Diagnostics.Metrics;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly ILogger<MonitoringController> _logger;
    private readonly Meter _meter;
    private readonly Counter<int> _requestCounter;
    private readonly Histogram<double> _requestDuration;

    public MonitoringController(ILogger<MonitoringController> logger)
    {
        _logger = logger;
        _meter = new Meter("LoveRose.API");
        _requestCounter = _meter.CreateCounter<int>("requests_total", "Total number of requests");
        _requestDuration = _meter.CreateHistogram<double>("request_duration_seconds", "Request duration in seconds");
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        _logger.LogInformation("Health check requested");
        
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Uptime = Environment.TickCount64,
            Memory = GC.GetTotalMemory(false),
            Threads = Environment.ProcessorCount
        };

        return Ok(health);
    }

    [HttpGet("metrics")]
    public IActionResult Metrics()
    {
        _logger.LogInformation("Metrics requested");
        
        var metrics = new
        {
            Timestamp = DateTime.UtcNow,
            Process = new
            {
                CpuUsage = Environment.ProcessorCount,
                MemoryUsage = GC.GetTotalMemory(false),
                ThreadCount = Environment.ProcessorCount,
                WorkingSet = Environment.WorkingSet
            },
            GarbageCollection = new
            {
                Gen0Collections = GC.CollectionCount(0),
                Gen1Collections = GC.CollectionCount(1),
                Gen2Collections = GC.CollectionCount(2)
            }
        };

        return Ok(metrics);
    }

    [HttpGet("logs")]
    public IActionResult Logs([FromQuery] string level = "Information")
    {
        _logger.LogInformation("Logs requested with level: {Level}", level);
        
        // In a real implementation, you would read from log files
        var logs = new[]
        {
            new { Level = "Information", Message = "Application started", Timestamp = DateTime.UtcNow.AddMinutes(-5) },
            new { Level = "Information", Message = "Database connected", Timestamp = DateTime.UtcNow.AddMinutes(-4) },
            new { Level = "Warning", Message = "High memory usage detected", Timestamp = DateTime.UtcNow.AddMinutes(-2) },
            new { Level = "Information", Message = "Health check requested", Timestamp = DateTime.UtcNow }
        };

        return Ok(logs.Where(l => l.Level == level || level == "All"));
    }
}

