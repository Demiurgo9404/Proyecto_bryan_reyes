using System;
using System.Collections.Generic;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Comment : BaseEntity
    {
        public string Content { get; set; }
        public int UserId { get; set; }
        public int PostId { get; set; }
        public int? ParentCommentId { get; set; }
        public string ImageUrl { get; set; }
        public string VideoUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public int LikeCount { get; set; }
        public int ReplyCount { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsPinned { get; set; }
        public bool IsRemoved { get; set; }
        public string RemovedReason { get; set; }
        public string[] UserMentions { get; set; } = Array.Empty<string>();
        public string[] Hashtags { get; set; } = Array.Empty<string>();

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Post Post { get; set; }
        public virtual Comment ParentComment { get; set; }
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
        public virtual ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
        public virtual ICollection<CommentMedia> Media { get; set; } = new List<CommentMedia>();
    }

    public class CommentLike : BaseEntity
    {
        public int CommentId { get; set; }
        public int UserId { get; set; }
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Comment Comment { get; set; }
        public virtual User User { get; set; }
    }

    public class CommentMedia : BaseEntity
    {
        public int CommentId { get; set; }
        public MediaType Type { get; set; }
        public string Url { get; set; }
        public string ThumbnailUrl { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public int? Duration { get; set; }
        public int Position { get; set; }
        public string AltText { get; set; }

        // Navigation property
        public virtual Comment Comment { get; set; }
    }
}
