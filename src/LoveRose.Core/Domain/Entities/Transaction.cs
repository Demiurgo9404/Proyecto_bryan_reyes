using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities;

public class Transaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // 'purchase', 'sale', 'refund', etc.
    
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    public string Currency { get; set; } = "USD";
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public string Status { get; set; } = "pending"; // 'pending', 'completed', 'failed', 'refunded'
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    // Navigation property
    public virtual User User { get; set; } = null!;
}
