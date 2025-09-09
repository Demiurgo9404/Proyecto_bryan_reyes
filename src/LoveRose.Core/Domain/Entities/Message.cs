using System;
using System.Collections.Generic;

namespace LoveRose.Core.Domain.Entities
{
    public class Message : BaseEntity
    {
        public string Content { get; set; }
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public string ImageUrl { get; set; }
        public string VideoUrl { get; set; }
        public int? RepliedToMessageId { get; set; }
        public bool IsDeletedForSender { get; set; }
        public bool IsDeletedForRecipient { get; set; }

        // Navigation properties
        public virtual User Sender { get; set; }
        public virtual User Recipient { get; set; }
        public virtual Message RepliedToMessage { get; set; }
        public virtual ICollection<Message> Replies { get; set; } = new List<Message>();
    }
}
