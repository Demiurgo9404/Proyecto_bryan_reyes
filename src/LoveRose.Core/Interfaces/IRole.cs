using System;

namespace LoveRose.Core.Interfaces
{
    public interface IRole<TKey> where TKey : IEquatable<TKey>
    {
        TKey Id { get; set; }
        string? Name { get; set; }
        string? NormalizedName { get; set; }
        string? Description { get; set; }
        bool IsSystemRole { get; }
        bool IsActive { get; }
        bool IsDeleted { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        
        void Update(string name, string? description = null);
        void Deactivate();
        void Activate();
    }
}
