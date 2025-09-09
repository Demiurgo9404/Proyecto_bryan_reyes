using System;
using LoveRose.Core.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Domain.Entities.Identity
{
    public class UserRole : IdentityUserRole<int>, IUserRole
    {
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual Role Role { get; set; } = null!;
        public DateTime AssignedAt { get; private set; } = DateTime.UtcNow;
        public string? AssignedBy { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;

        public UserRole() {}

        public UserRole(ApplicationUser user, Role role, string? assignedBy = null)
        {
            User = user ?? throw new ArgumentNullException(nameof(user));
            Role = role ?? throw new ArgumentNullException(nameof(role));
            UserId = user.Id;
            RoleId = role.Id;
            AssignedBy = assignedBy;
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void SetExpiration(DateTime? expirationDate)
        {
            ExpiresAt = expirationDate;
        }
    }
}
