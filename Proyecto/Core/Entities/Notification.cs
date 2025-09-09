using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class Notification : BaseEntity
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Message { get; set; }
    
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // Info, Success, Warning, Error, etc.
    
    [MaxLength(50)]
    public string? Category { get; set; } // Message, Follow, Like, Comment, etc.
    
    public bool IsRead { get; set; }
    
    public DateTime? ReadAt { get; set; }
    
    [MaxLength(255)]
    public string? ActionUrl { get; set; }
    
    [MaxLength(50)]
    public string? RelatedEntityType { get; set; } // User, Content, Message, etc.
    
    public int? RelatedEntityId { get; set; }
    
    // Navigation property
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
}
