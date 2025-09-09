using System;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Interfaces
{
    /// <summary>
    /// Interface representing a user in the LoveRose application
    /// </summary>
    /// <typeparam name="TKey">The type of the user's primary key</typeparam>
    public interface IUser<TKey> where TKey : IEquatable<TKey>
    {
        // Basic Information
        TKey Id { get; set; }
        string UserName { get; set; }
        string Email { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }
        string DisplayName { get; set; }
        string Bio { get; set; }
        string AvatarUrl { get; set; }
        string CoverImageUrl { get; set; }
        
        // Contact Information
        string? Website { get; set; }
        string? Location { get; set; }
        
        // Account Settings
        bool IsVerified { get; set; }
        bool IsPrivate { get; set; }
        DateTime? BirthDate { get; set; }
        Gender Gender { get; set; }
        UserType UserType { get; set; }
        UserStatus Status { get; set; }
        
        // Timestamps
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        DateTime? LastActive { get; set; }
        
        // Preferences
        string TimeZone { get; set; }
        string Language { get; set; }
        string Theme { get; set; }
        
        // Status Flags
        bool IsOnline { get; set; }
        bool IsDeleted { get; set; }

        /// <summary>
        /// Gets the full name of the user (FirstName + LastName)
        /// </summary>
        /// <returns>The full name of the user</returns>
        string GetFullName();

        /// <summary>
        /// Updates the LastActive timestamp to the current UTC time
        /// </summary>
        void UpdateLastActive();

        /// <summary>
        /// Deactivates the user account
        /// </summary>
        void DeactivateAccount();

        /// <summary>
        /// Activates a previously deactivated user account
        /// </summary>
        void ActivateAccount();
    }
}
