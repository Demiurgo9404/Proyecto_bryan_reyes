using System;
using System.Collections.Generic;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Story : BaseEntity
    {
        public int UserId { get; set; }
        public string MediaUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string Caption { get; set; }
        public string Location { get; set; }
        public StoryType Type { get; set; }
        public StoryMediaType MediaType { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsArchived { get; set; }
        public bool IsHighlighted { get; set; }
        public string HighlightCoverUrl { get; set; }
        public int ViewCount { get; set; }
        public int ReplyCount { get; set; }
        public int ReactionCount { get; set; }
        public bool AllowReplies { get; set; } = true;
        public bool AllowSharing { get; set; } = true;
        public bool ShowViewerList { get; set; } = true;
        public bool IsCloseFriendsOnly { get; set; }
        public string[] AllowedUserIds { get; set; } = Array.Empty<string>();

        // Navigation properties
        public virtual User User { get; set; }
        public virtual ICollection<StoryView> Views { get; set; } = new List<StoryView>();
        public virtual ICollection<StoryReaction> Reactions { get; set; } = new List<StoryReaction>();
        public virtual ICollection<StoryReply> Replies { get; set; } = new List<StoryReply>();
    }

    public class StoryView : BaseEntity
    {
        public int StoryId { get; set; }
        public int UserId { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        public int ViewDuration { get; set; } // in seconds
        public bool IsSkipped { get; set; }
        public string? Reaction { get; set; }

        // Navigation properties
        public virtual Story Story { get; set; }
        public virtual User User { get; set; }
    }

    public class StoryReaction : BaseEntity
    {
        public int StoryId { get; set; }
        public int UserId { get; set; }
        public string ReactionType { get; set; }
        public DateTime ReactedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Story Story { get; set; }
        public virtual User User { get; set; }
    }

    public class StoryReply : BaseEntity
    {
        public int StoryId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; }
        public string? MediaUrl { get; set; }
        public DateTime RepliedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }

        // Navigation properties
        public virtual Story Story { get; set; }
        public virtual User User { get; set; }
    }
}
