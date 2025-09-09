namespace LoveRose.Infrastructure.Data
{
    public class DatabaseConfig
    {
        public string ConnectionString { get; set; }
        public bool UseInMemoryDatabase { get; set; }
        public bool EnableSensitiveDataLogging { get; set; }
        public bool EnableDetailedErrors { get; set; }
        public int MaxRetryCount { get; set; } = 5;
        public int CommandTimeout { get; set; } = 30; // seconds
        
        // For distributed cache (if needed)
        public string RedisConnectionString { get; set; }
        public bool UseRedis { get; set; }
    }
}
