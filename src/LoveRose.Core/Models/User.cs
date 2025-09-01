using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Models;

public class User : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "date")] // Usar tipo date para PostgreSQL
    public DateTime DateOfBirth { get; set; }
    
    [MaxLength(1000)]
    public string? ProfileImageUrl { get; set; }
    
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    // Relaciones
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
    
    // Propiedad de solo lectura para el nombre completo
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";
    
    // Constructor para inicializar fechas
    public User()
    {
        CreatedAt = DateTime.UtcNow;
    }
}
