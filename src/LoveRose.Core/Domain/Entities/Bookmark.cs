using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities
{
    public class Bookmark : BaseEntity
    {
        public int UserId { get; set; }
        public int PostId { get; set; }
        public int? CollectionId { get; set; }
        public string[] Tags { get; set; } = Array.Empty<string>();
        public string Note { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
        public int Position { get; set; }
        public string CustomThumbnailUrl { get; set; }
        public string[] Categories { get; set; } = Array.Empty<string>();
        public bool IsFavorite { get; set; }
        public DateTime? ReminderDate { get; set; }
        public string ColorLabel { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Post Post { get; set; }
        public virtual BookmarkCollection Collection { get; set; }
    }

    public class BookmarkCollection : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPrivate { get; set; }
        public string CoverImageUrl { get; set; }
        public int UserId { get; set; }
        public int BookmarkCount { get; set; }
        public bool IsFeatured { get; set; }
        public string[] Tags { get; set; } = Array.Empty<string>();
        public int FollowerCount { get; set; }
        public bool IsDefault { get; set; }
        public int Position { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public virtual ICollection<BookmarkCollectionFollower> Followers { get; set; } = new List<BookmarkCollectionFollower>();
    }

    public class BookmarkCollectionFollower : BaseEntity
    {
        public int CollectionId { get; set; }
        public int UserId { get; set; }
        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
        public bool NotificationsEnabled { get; set; } = true;

        // Navigation properties
        public virtual BookmarkCollection Collection { get; set; }
        public virtual User User { get; set; }
    }

    public class BookmarkTag : BaseEntity
    {
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Description { get; set; }
        public int UsageCount { get; set; }
        public bool IsFeatured { get; set; }
        public string IconUrl { get; set; }
        public string Color { get; set; }
        public int? ParentTagId { get; set; }
        public bool IsActive { get; set; } = true;
        public int Position { get; set; }

        // Navigation properties
        public virtual BookmarkTag ParentTag { get; set; }
        public virtual ICollection<BookmarkTag> ChildTags { get; set; } = new List<BookmarkTag>();
        public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
    }
}
