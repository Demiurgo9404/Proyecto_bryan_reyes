using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.Metrics;

namespace LoveRose.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerformanceController : ControllerBase
{
    private readonly ILogger<PerformanceController> _logger;
    private readonly Meter _meter;
    private readonly Counter<int> _apiRequestCounter;
    private readonly Histogram<double> _apiRequestDuration;
    private readonly Counter<int> _errorCounter;

    public PerformanceController(ILogger<PerformanceController> logger, Meter meter)
    {
        _logger = logger;
        _meter = meter;
        _apiRequestCounter = _meter.CreateCounter<int>("api_requests_total", "Total API requests");
        _apiRequestDuration = _meter.CreateHistogram<double>("api_request_duration_seconds", "API request duration");
        _errorCounter = _meter.CreateCounter<int>("api_errors_total", "Total API errors");
    }

    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        _apiRequestCounter.Add(1, new KeyValuePair<string, object?>("endpoint", "stats"));
        
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        
        try
        {
            var stats = new
            {
                Timestamp = DateTime.UtcNow,
                System = new
                {
                    MachineName = Environment.MachineName,
                    ProcessorCount = Environment.ProcessorCount,
                    WorkingSet = Environment.WorkingSet,
                    TotalMemory = GC.GetTotalMemory(false),
                    AvailableMemory = GC.GetTotalMemory(false) - GC.GetTotalMemory(true)
                },
                Performance = new
                {
                    Uptime = Environment.TickCount64,
                    GcCollections = new
                    {
                        Gen0 = GC.CollectionCount(0),
                        Gen1 = GC.CollectionCount(1),
                        Gen2 = GC.CollectionCount(2)
                    },
                    Threads = new
                    {
                        Current = ThreadPool.ThreadCount,
                        Available = ThreadPool.CompletedWorkItemCount,
                        Pending = ThreadPool.PendingWorkItemCount
                    }
                },
                Application = new
                {
                    Version = "1.0.0",
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    Framework = Environment.Version.ToString()
                }
            };

            stopwatch.Stop();
            _apiRequestDuration.Record(stopwatch.Elapsed.TotalSeconds);

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _errorCounter.Add(1, new KeyValuePair<string, object?>("error_type", "stats_error"));
            _logger.LogError(ex, "Error getting performance stats");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("memory")]
    public IActionResult GetMemoryInfo()
    {
        _apiRequestCounter.Add(1, new KeyValuePair<string, object?>("endpoint", "memory"));
        
        var memoryInfo = new
        {
            Timestamp = DateTime.UtcNow,
            TotalMemory = GC.GetTotalMemory(false),
            Gen0Collections = GC.CollectionCount(0),
            Gen1Collections = GC.CollectionCount(1),
            Gen2Collections = GC.CollectionCount(2),
            IsServerGC = false, // Simplified for .NET 8
            LargeObjectHeapCompactionMode = "Default"
        };

        return Ok(memoryInfo);
    }

    [HttpPost("gc")]
    public IActionResult ForceGarbageCollection()
    {
        _apiRequestCounter.Add(1, new KeyValuePair<string, object?>("endpoint", "gc"));
        
        var beforeMemory = GC.GetTotalMemory(false);
        
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        
        var afterMemory = GC.GetTotalMemory(false);
        var freedMemory = beforeMemory - afterMemory;
        
        _logger.LogInformation("Forced garbage collection. Freed {FreedMemory} bytes", freedMemory);
        
        return Ok(new
        {
            Message = "Garbage collection completed",
            BeforeMemory = beforeMemory,
            AfterMemory = afterMemory,
            FreedMemory = freedMemory,
            Timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("threads")]
    public IActionResult GetThreadInfo()
    {
        _apiRequestCounter.Add(1, new KeyValuePair<string, object?>("endpoint", "threads"));
        
        var threadInfo = new
        {
            Timestamp = DateTime.UtcNow,
            CurrentThreads = ThreadPool.ThreadCount,
            CompletedWorkItems = ThreadPool.CompletedWorkItemCount,
            PendingWorkItems = ThreadPool.PendingWorkItemCount,
            MaxWorkerThreads = 0, // Not available in .NET 8
            MaxCompletionPortThreads = 0, // Not available in .NET 8
            MinWorkerThreads = 0, // Not available in .NET 8
            MinCompletionPortThreads = 0 // Not available in .NET 8
        };

        return Ok(threadInfo);
    }
}

