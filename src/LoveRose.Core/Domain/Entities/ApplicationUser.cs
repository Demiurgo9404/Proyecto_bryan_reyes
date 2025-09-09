using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using LoveRose.Core.Domain.Enums;
using LoveRose.Core.Domain.Interfaces;

namespace LoveRose.Core.Domain.Entities
{
    /// <summary>
    /// Represents a user in the LoveRose application
    /// </summary>
    public class ApplicationUser : IdentityUser<int>, IUser<int>
    {
        // Basic Information
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = "/images/avatars/default-avatar.png";
        public string CoverImageUrl { get; set; } = "/images/covers/default-cover.jpg";
        
        // Contact Information
        public string? Website { get; set; }
        public string? Location { get; set; }
        
        // Account Settings
        public bool IsVerified { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime? BirthDate { get; set; }
        public Gender Gender { get; set; } = Gender.Other;
        public UserType UserType { get; set; } = UserType.Standard;
        public UserStatus Status { get; set; } = UserStatus.Active;
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastActive { get; set; }
        
        // Preferences
        public string TimeZone { get; set; } = "UTC";
        public string Language { get; set; } = "es";
        public string Theme { get; set; } = "light";
        
        // Status Flags
        public bool IsOnline { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        /// <summary>
        /// Default constructor
        /// </summary>
        public ApplicationUser() {}

        /// <summary>
        /// Creates a new user with the specified username and email
        /// </summary>
        /// <param name="userName">The username for the new user</param>
        /// <param name="email">The email address for the new user</param>
        public ApplicationUser(string userName, string email)
        {
            UserName = userName;
            Email = email;
            EmailConfirmed = false;
            SecurityStamp = Guid.NewGuid().ToString();
            CreatedAt = DateTime.UtcNow;
            LastActive = DateTime.UtcNow;
        }

        /// <summary>
        /// Gets the full name of the user (FirstName + LastName)
        /// </summary>
        /// <returns>The full name of the user</returns>
        public string GetFullName()
        {
            return $"{FirstName} {LastName}".Trim();
        }

        /// <summary>
        /// Updates the LastActive timestamp to the current UTC time
        /// </summary>
        public void UpdateLastActive()
        {
            LastActive = DateTime.UtcNow;
        }

        /// <summary>
        /// Deactivates the user account
        /// </summary>
        public void DeactivateAccount()
        {
            Status = UserStatus.Inactive;
            IsOnline = false;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Activates a previously deactivated user account
        /// </summary>
        public void ActivateAccount()
        {
            if (Status == UserStatus.Inactive)
            {
                Status = UserStatus.Active;
                UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
