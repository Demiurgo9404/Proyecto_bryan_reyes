using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Domain.Entities;

public class UserRole : IdentityUserRole<string>
{
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
