using System;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Notification : BaseEntity
    {
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public NotificationType Type { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }
        public string ImageUrl { get; set; }
        public string ActionUrl { get; set; }

        // Navigation property
        public virtual User User { get; set; }
    }
}
