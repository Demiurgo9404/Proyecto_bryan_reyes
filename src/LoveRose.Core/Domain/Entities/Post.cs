using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities;

public class Post
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    [MaxLength(2200)]
    public string? Caption { get; set; }
    
    public string? Location { get; set; }
    
    public PostType Type { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Engagement metrics
    public int LikesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;
    public int SharesCount { get; set; } = 0;
    public int ViewsCount { get; set; } = 0;
    
    // Privacy settings
    public PostVisibility Visibility { get; set; } = PostVisibility.Public;
    public bool AllowComments { get; set; } = true;
    public bool AllowSharing { get; set; } = true;
    
    // Collections
    public ICollection<PostMedia> Media { get; set; } = new List<PostMedia>();
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<PostTag> Tags { get; set; } = new List<PostTag>();
    public ICollection<PostHashtag> Hashtags { get; set; } = new List<PostHashtag>();
    public ICollection<PostShare> Shares { get; set; } = new List<PostShare>();
    public ICollection<PostCollection> Collections { get; set; } = new List<PostCollection>();
}

public enum PostType
{
    Photo = 1,
    Video = 2,
    Carousel = 3,
    Text = 4,
    Reel = 5
}

public enum PostVisibility
{
    Public = 1,
    Followers = 2,
    Private = 3,
    Close_Friends = 4
}
