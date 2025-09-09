using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Proyecto.Core.Entities;

public class Comment : BaseEntity
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int ContentId { get; set; }
    
    public int? ParentCommentId { get; set; }
    
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
    
    public int LikeCount { get; set; }
    
    public bool IsEdited { get; set; }
    
    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
    
    [ForeignKey("ContentId")]
    public virtual Content? Content { get; set; }
    
    [ForeignKey("ParentCommentId")]
    public virtual Comment? ParentComment { get; set; }
    
    public virtual ICollection<Comment>? Replies { get; set; }
}
