using System;

namespace LoveRose.Core.Domain.Entities
{
    public class Follow : BaseEntity
    {
        public int FollowerId { get; set; }
        public int FollowingId { get; set; }
        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
        public bool IsMuted { get; set; }
        public bool IsCloseFriend { get; set; }
        public bool IsBlocked { get; set; }

        // Navigation properties
        public virtual User Follower { get; set; }
        public virtual User Followed { get; set; }
    }
}
