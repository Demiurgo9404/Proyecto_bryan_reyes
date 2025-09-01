using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LoveRose.Core.Domain.Enums;

namespace LoveRose.Core.Domain.Entities
{
    public class Conversation
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public ConversationType Type { get; set; } = ConversationType.Direct;

        [Required]
        public string CreatedById { get; set; }

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public string? LastMessageId { get; set; }
        [ForeignKey("LastMessageId")]
        public virtual Message? LastMessage { get; set; }

        public DateTime? LastActivityAt { get; set; }

        // Navigation properties
        public virtual ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }

    public class ConversationParticipant
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public ParticipantRole Role { get; set; } = ParticipantRole.Member;

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LeftAt { get; set; }

        public DateTime? LastReadAt { get; set; }
        public string? LastReadMessageId { get; set; }

        public bool IsMuted { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class Message
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; }

        [Required]
        public string SenderId { get; set; }

        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; }

        public string? Content { get; set; }

        public MessageType Type { get; set; } = MessageType.Text;

        // Media attachments
        public string? MediaUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public string? MimeType { get; set; }

        // Reply functionality
        public string? ReplyToMessageId { get; set; }
        [ForeignKey("ReplyToMessageId")]
        public virtual Message? ReplyToMessage { get; set; }

        // Forward functionality
        public string? ForwardedFromMessageId { get; set; }
        [ForeignKey("ForwardedFromMessageId")]
        public virtual Message? ForwardedFromMessage { get; set; }

        // Message status
        public MessageStatus Status { get; set; } = MessageStatus.Sent;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Reactions
        public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();

        // Read receipts
        public virtual ICollection<MessageRead> ReadReceipts { get; set; } = new List<MessageRead>();
    }

    public class MessageReaction
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MessageId { get; set; }

        [ForeignKey("MessageId")]
        public virtual Message Message { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        [StringLength(10)]
        public string Emoji { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MessageRead
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MessageId { get; set; }

        [ForeignKey("MessageId")]
        public virtual Message Message { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public DateTime ReadAt { get; set; } = DateTime.UtcNow;
    }

    public class Call
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; }

        [Required]
        public string InitiatedById { get; set; }

        [ForeignKey("InitiatedById")]
        public virtual User InitiatedBy { get; set; }

        public CallType Type { get; set; } = CallType.Voice;

        public CallStatus Status { get; set; } = CallStatus.Initiated;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }

        public int? Duration { get; set; } // Duration in seconds

        // Navigation properties
        public virtual ICollection<CallParticipant> Participants { get; set; } = new List<CallParticipant>();
    }

    public class CallParticipant
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string CallId { get; set; }

        [ForeignKey("CallId")]
        public virtual Call Call { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public DateTime? JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        public CallParticipantStatus Status { get; set; } = CallParticipantStatus.Invited;
    }
}

namespace LoveRose.Core.Domain.Enums
{
    public enum ConversationType
    {
        Direct = 1,
        Group = 2
    }

    public enum ParticipantRole
    {
        Member = 1,
        Admin = 2,
        Owner = 3
    }

    public enum MessageType
    {
        Text = 1,
        Image = 2,
        Video = 3,
        Audio = 4,
        Document = 5,
        Location = 6,
        Contact = 7,
        Sticker = 8,
        System = 9
    }

    public enum MessageStatus
    {
        Sending = 1,
        Sent = 2,
        Delivered = 3,
        Read = 4,
        Failed = 5
    }

    public enum CallType
    {
        Voice = 1,
        Video = 2
    }

    public enum CallStatus
    {
        Initiated = 1,
        Ringing = 2,
        Active = 3,
        Ended = 4,
        Missed = 5,
        Declined = 6,
        Failed = 7
    }

    public enum CallParticipantStatus
    {
        Invited = 1,
        Joined = 2,
        Left = 3,
        Declined = 4
    }
}
