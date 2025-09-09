using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class ModelProfile
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Bio { get; set; }
    
    [MaxLength(255)]
    public string? ProfilePictureUrl { get; set; }
    
    [MaxLength(255)]
    public string? CoverPhotoUrl { get; set; }
    
    public bool IsOnline { get; set; }
    
    public DateTime? LastSeen { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalEarnings { get; set; }
    
    public int TotalSessions { get; set; }
    
    [Column(TypeName = "decimal(3,2)")]
    public decimal AverageRating { get; set; }
    
    public bool IsVerified { get; set; }
    
    [MaxLength(50)]
    public string? Category { get; set; }
    
    [MaxLength(20)]
    public string? Status { get; set; } // Available, Busy, Away, etc.
    
    public int TotalFollowers { get; set; }
    
    public int TotalFollowing { get; set; }
    
    public int TotalLikes { get; set; }
    
    public int TotalViews { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ApplicationUser? User { get; set; }
    public virtual ICollection<Content>? Contents { get; set; }
    public virtual ICollection<Message>? SentMessages { get; set; }
    public virtual ICollection<Message>? ReceivedMessages { get; set; }
    public virtual ICollection<Notification>? Notifications { get; set; }
    public virtual ICollection<Transaction>? Transactions { get; set; }
}
