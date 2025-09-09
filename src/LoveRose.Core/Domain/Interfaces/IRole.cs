using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IRole<TKey> where TKey : IEquatable<TKey>
    {
        TKey Id { get; set; }
        string? Name { get; set; }
        string? NormalizedName { get; set; }
        string? Description { get; set; }
        bool IsSystemRole { get; set; }
        bool IsActive { get; set; }
        string? Color { get; set; }
        int? Level { get; set; }
        string? Permissions { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        bool IsDeleted { get; set; }
        string? CreatedBy { get; set; }
        string? UpdatedBy { get; set; }
        
        ICollection<IUserRole> UserRoles { get; set; }
        ICollection<IRoleClaim> RoleClaims { get; set; }
        
        void Update(string name, string? description = null);
        void MarkAsSystemRole();
        void Deactivate();
        void Activate();
    }
}
