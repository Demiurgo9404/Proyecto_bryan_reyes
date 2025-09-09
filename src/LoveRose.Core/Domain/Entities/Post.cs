using System;
using System.Collections.Generic;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Post : BaseEntity
    {
        public string Content { get; set; }
        public string ImageUrl { get; set; }
        public string VideoUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public int ViewCount { get; set; }
        public bool IsPinned { get; set; }
        public bool IsArchived { get; set; }
        public PostVisibility Visibility { get; set; }
        public int? ParentPostId { get; set; }
        public int UserId { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Post ParentPost { get; set; }
        public virtual ICollection<Post> Comments { get; set; } = new List<Post>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public virtual ICollection<PostMedia> Media { get; set; } = new List<PostMedia>();
    }

    public class PostMedia : BaseEntity
    {
        public string Url { get; set; }
        public MediaType Type { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public int? Duration { get; set; }
        public string ThumbnailUrl { get; set; }
        public int PostId { get; set; }
        public int Position { get; set; }

        public virtual Post Post { get; set; }
    }
}
