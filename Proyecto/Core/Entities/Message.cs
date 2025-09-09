using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class Message : BaseEntity
{
    [Required]
    public string SenderId { get; set; } = string.Empty;
    
    [Required]
    public string ReceiverId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
    
    public bool IsRead { get; set; }
    
    public DateTime? ReadAt { get; set; }
    
    [MaxLength(255)]
    public string? AttachmentUrl { get; set; }
    
    [MaxLength(50)]
    public string? MessageType { get; set; } // Text, Image, Video, Audio, etc.
    
    // Navigation properties
    [ForeignKey("SenderId")]
    public virtual ApplicationUser? Sender { get; set; }
    
    [ForeignKey("ReceiverId")]
    public virtual ApplicationUser? Receiver { get; set; }
}
