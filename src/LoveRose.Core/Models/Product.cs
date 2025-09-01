using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoveRose.Core.Models;

public class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    [Column(TypeName = "numeric(18,2)")] 
    public decimal Price { get; set; }
    
    [MaxLength(1000)]
    public string? ImageUrl { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    // Relaciones
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    
    // Constructor para inicializar fechas
    public Product()
    {
        CreatedAt = DateTime.UtcNow;
    }
}
