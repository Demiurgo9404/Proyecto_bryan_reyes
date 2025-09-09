namespace LoveRose.Infrastructure.Identity
{
    public class JwtConfig
    {
        public string Secret { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpirationInMinutes { get; set; } = 1440;
        public int RefreshTokenExpirationInDays { get; set; } = 7;
    }
}
