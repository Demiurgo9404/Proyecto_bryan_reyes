using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class Transaction : BaseEntity
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string TransactionType { get; set; } = string.Empty; // Deposit, Withdrawal, Purchase, Payout, etc.
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [MaxLength(3)]
    public string Currency { get; set; } = "USD";
    
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed, Refunded, etc.
    
    [MaxLength(255)]
    public string? Description { get; set; }
    
    [MaxLength(100)]
    public string? PaymentMethod { get; set; }
    
    [MaxLength(100)]
    public string? PaymentReference { get; set; }
    
    [MaxLength(100)]
    public string? GatewayTransactionId { get; set; }
    
    public DateTime? ProcessedAt { get; set; }
    
    public int? RelatedEntityId { get; set; }
    
    [MaxLength(50)]
    public string? RelatedEntityType { get; set; } // Content, Subscription, Tip, etc.
    
    // Navigation property
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
}
