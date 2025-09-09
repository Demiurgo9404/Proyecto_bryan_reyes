using System;
using System.Collections.Generic;
using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Domain.Entities.Identity
{
    public class Role : IdentityRole<int>, IBaseEntity
    {
        private string? _name;
        private string? _normalizedName;

        // IBaseEntity implementation
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public override string? Name
        {
            get => _name;
            set
            {
                _name = value;
                NormalizedName = _name?.ToUpperInvariant();
            }
        }

        public override string? NormalizedName
        {
            get => _normalizedName;
            set => _normalizedName = value?.ToUpperInvariant();
        }

        public string? Description { get; set; }
        public bool IsSystemRole { get; private set; }
        public string? Color { get; set; }
        public int? Level { get; set; }
        public string? Permissions { get; set; }
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<RoleClaim> RoleClaims { get; set; } = new List<RoleClaim>();

        public Role() {}

        public Role(string name, string? description = null)
        {
            Name = name;
            Description = description;
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(string name, string? description = null)
        {
            Name = name;
            Description = description;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsSystemRole()
        {
            IsSystemRole = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            IsDeleted = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            IsActive = true;
            IsDeleted = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public class RoleClaim : IdentityRoleClaim<int>
    {
        public virtual Role Role { get; set; } = null!;
    }
}
