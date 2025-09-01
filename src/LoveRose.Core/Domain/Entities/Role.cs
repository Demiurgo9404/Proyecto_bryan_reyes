using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace LoveRose.Core.Domain.Entities;

public class Role : IdentityRole
{
    public string? Description { get; set; }
    
    // Navigation property
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
