using System;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public string TransactionId { get; set; }
        public int SenderId { get; set; }
        public int? RecipientId { get; set; }
        public decimal Amount { get; set; }
        public decimal Fee { get; set; }
        public decimal NetAmount => Amount - Fee;
        public string Currency { get; set; } = "USD";
        public string Description { get; set; }
        public TransactionStatus Status { get; set; }
        public TransactionType Type { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentProvider { get; set; }
        public string PaymentProviderTransactionId { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string Notes { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }

        // Navigation properties
        public virtual User Sender { get; set; }
        public virtual User Recipient { get; set; }
        public virtual VideoCall VideoCall { get; set; }
    }
}
