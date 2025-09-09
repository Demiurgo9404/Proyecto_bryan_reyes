using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class ContentInteraction : BaseEntity
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int ContentId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string InteractionType { get; set; } = string.Empty; // View, Like, Share, Save, etc.
    
    [MaxLength(500)]
    public string? Metadata { get; set; } // Additional data about the interaction
    
    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
    
    [ForeignKey("ContentId")]
    public virtual Content? Content { get; set; }
}
