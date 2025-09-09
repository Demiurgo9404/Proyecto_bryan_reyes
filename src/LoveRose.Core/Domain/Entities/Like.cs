using System;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Like : BaseEntity
    {
        public int UserId { get; set; }
        public int PostId { get; set; }
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;
        public LikeType Type { get; set; } = LikeType.Like;

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Post Post { get; set; }
    }
}
