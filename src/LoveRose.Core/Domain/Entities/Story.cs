using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities;

public class Story
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    [MaxLength(500)]
    public string? Text { get; set; }
    
    [MaxLength(500)]
    public string? MediaUrl { get; set; }
    
    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }
    
    public StoryType Type { get; set; }
    
    [MaxLength(100)]
    public string? BackgroundColor { get; set; }
    
    [MaxLength(100)]
    public string? TextColor { get; set; }
    
    [MaxLength(100)]
    public string? FontFamily { get; set; }
    
    // Duración del video/audio en segundos
    public int? Duration { get; set; }
    
    // Música de fondo
    [MaxLength(200)]
    public string? MusicTitle { get; set; }
    
    [MaxLength(200)]
    public string? MusicArtist { get; set; }
    
    [MaxLength(500)]
    public string? MusicUrl { get; set; }
    
    // Configuraciones de privacidad
    public StoryVisibility Visibility { get; set; } = StoryVisibility.Followers;
    public bool AllowReplies { get; set; } = true;
    public bool AllowSharing { get; set; } = true;
    
    // Métricas
    public int ViewsCount { get; set; } = 0;
    public int RepliesCount { get; set; } = 0;
    
    // Fechas importantes
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; } // 24 horas después de CreatedAt
    
    public bool IsActive { get; set; } = true;
    public bool IsHighlight { get; set; } = false; // Para destacadas
    
    // Colecciones relacionadas
    public ICollection<StoryView> Views { get; set; } = new List<StoryView>();
    public ICollection<StoryReply> Replies { get; set; } = new List<StoryReply>();
    public ICollection<StorySticker> Stickers { get; set; } = new List<StorySticker>();
    public ICollection<StoryPoll> Polls { get; set; } = new List<StoryPoll>();
    public ICollection<StoryQuestion> Questions { get; set; } = new List<StoryQuestion>();
    
    // Referencia a publicación compartida (si aplica)
    public Guid? SharedPostId { get; set; }
    public Post? SharedPost { get; set; }
}

public enum StoryType
{
    Photo = 1,
    Video = 2,
    Text = 3,
    Boomerang = 4,
    Live = 5
}

public enum StoryVisibility
{
    Public = 1,
    Followers = 2,
    CloseFriends = 3,
    Custom = 4
}
