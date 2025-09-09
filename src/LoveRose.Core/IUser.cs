using System;
using System.Collections.Generic;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IUser<TKey> where TKey : IEquatable<TKey>
    {
        TKey Id { get; set; }
        string? UserName { get; set; }
        string? Email { get; set; }
        string? FirstName { get; set; }
        string? LastName { get; set; }
        string? DisplayName { get; set; }
        string? Bio { get; set; }
        DateTime? BirthDate { get; set; }
        string? AvatarUrl { get; set; }
        string? CoverImageUrl { get; set; }
        string? Website { get; set; }
        string? Location { get; set; }
        bool IsVerified { get; set; }
        bool IsPrivate { get; set; }
        DateTime? LastActive { get; set; }
        UserType UserType { get; set; }
        UserStatus Status { get; set; }
        Gender Gender { get; set; }
        string? TimeZone { get; set; }
        string? Language { get; set; }
        string? Theme { get; set; }
        bool IsDeleted { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        
        string GetFullName();
        void UpdateLastActive();
        void DeactivateAccount();
        void ActivateAccount();
    }
}
