using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Domain.Entities;

public class PostMedia
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;
    
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }
    
    public MediaType Type { get; set; }
    
    [MaxLength(100)]
    public string? MimeType { get; set; }
    
    public long FileSize { get; set; }
    
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? Duration { get; set; } // Para videos en segundos
    
    public int Order { get; set; } = 0; // Para carruseles
    
    [MaxLength(200)]
    public string? AltText { get; set; } // Accesibilidad
    
    // Filtros y efectos aplicados
    [MaxLength(100)]
    public string? FilterName { get; set; }
    
    public string? FilterSettings { get; set; } // JSON con configuraciones
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
}

public enum MediaType
{
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4
}
