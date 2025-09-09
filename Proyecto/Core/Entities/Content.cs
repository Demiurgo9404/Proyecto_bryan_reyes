using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class Content : BaseEntity
{
    [Required]
    public int ModelProfileId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string ContentType { get; set; } = string.Empty; // Photo, Video, Stream, etc.
    
    [Required]
    [MaxLength(255)]
    public string MediaUrl { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? MediaThumbnailUrl { get; set; }
    
    [MaxLength(10)]
    public string? MediaDuration { get; set; } // For videos/audio
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Price { get; set; }
    
    public bool IsPaid { get; set; }
    
    public bool IsPrivate { get; set; }
    
    public int ViewCount { get; set; }
    
    public int LikeCount { get; set; }
    
    public int CommentCount { get; set; }
    
    [MaxLength(20)]
    public string? Status { get; set; } // Draft, Published, Archived, etc.
    
    // Navigation properties
    public virtual ModelProfile? ModelProfile { get; set; }
    public virtual ICollection<Comment>? Comments { get; set; }
    public virtual ICollection<ContentInteraction>? Interactions { get; set; }
}
