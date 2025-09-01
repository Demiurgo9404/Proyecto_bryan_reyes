using System;
using System.ComponentModel.DataAnnotations;
using LoveRose.Core.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        [MaxLength(3)]
        public string Currency { get; set; }
        
        [Required]
        public PaymentStatus Status { get; set; }
        
        [Required]
        public string PaymentMethodId { get; set; }
        
        public string ExternalTransactionId { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        public DateTime? ProcessedAt { get; set; }
        
        public string Metadata { get; set; }
        
        // Relaciones
        public string UserId { get; set; }
        public virtual User User { get; set; }
        
        public Payment()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            Status = PaymentStatus.Pending;
        }
    }
}
