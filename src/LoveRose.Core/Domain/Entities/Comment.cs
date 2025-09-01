using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities;

public class Comment
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    [MaxLength(2200)]
    public string Content { get; set; } = string.Empty;
    
    // Para respuestas a comentarios
    public Guid? ParentCommentId { get; set; }
    public Comment? ParentComment { get; set; }
    
    // Métricas
    public int LikesCount { get; set; } = 0;
    public int RepliesCount { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsEdited { get; set; } = false;
    public bool IsPinned { get; set; } = false; // Para comentarios destacados
    
    // Colecciones
    public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    public ICollection<CommentMention> Mentions { get; set; } = new List<CommentMention>();
}

public class CommentLike
{
    public Guid Id { get; set; }
    public Guid CommentId { get; set; }
    public Comment Comment { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
}

public class CommentMention
{
    public Guid Id { get; set; }
    public Guid CommentId { get; set; }
    public Comment Comment { get; set; } = null!;
    
    public Guid MentionedUserId { get; set; }
    public User MentionedUser { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
}
