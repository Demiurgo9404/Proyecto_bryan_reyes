namespace LoveRose.Core.Domain.Interfaces
{
    public interface IRoleClaim
    {
        int Id { get; set; }
        int RoleId { get; set; }
        string? ClaimType { get; set; }
        string? ClaimValue { get; set; }
        
        IRole Role { get; set; }
    }
}
