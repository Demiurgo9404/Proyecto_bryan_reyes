using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Reel
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string VideoUrl { get; set; }

        public string? ThumbnailUrl { get; set; }

        [Range(1, 180)] // 1 second to 3 minutes
        public int Duration { get; set; }

        // Music and Audio
        public string? MusicTitle { get; set; }
        public string? MusicArtist { get; set; }
        public string? MusicUrl { get; set; }
        public string? OriginalAudioUrl { get; set; }
        public bool HasOriginalAudio { get; set; } = true;

        // Effects and Filters
        public string? FilterName { get; set; }
        public string? EffectsData { get; set; } // JSON string for effects configuration

        // Engagement metrics
        public int ViewsCount { get; set; } = 0;
        public int LikesCount { get; set; } = 0;
        public int CommentsCount { get; set; } = 0;
        public int SharesCount { get; set; } = 0;

        // Privacy and visibility
        public PrivacyLevel Privacy { get; set; } = PrivacyLevel.Public;
        public bool AllowComments { get; set; } = true;
        public bool AllowDuet { get; set; } = true;
        public bool AllowStitch { get; set; } = true;

        // Hashtags and mentions
        public string? Hashtags { get; set; } // Comma-separated hashtags
        public string? Mentions { get; set; } // Comma-separated user IDs

        // Location
        public string? LocationName { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        public virtual ICollection<ReelView> Views { get; set; } = new List<ReelView>();
    }

    public class ReelView
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ReelId { get; set; }

        [ForeignKey("ReelId")]
        public virtual Reel Reel { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        [Range(0, 100)]
        public int WatchPercentage { get; set; } = 0; // Percentage of video watched
    }
}
