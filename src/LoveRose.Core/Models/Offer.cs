using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoveRose.Core.Models;

public class Offer
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal OfferAmount { get; set; }
    
    [MaxLength(500)]
    public string? Message { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pendiente"; // Pendiente, Aceptada, Rechazada, Cancelada
    
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    // Propiedades de navegación
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    [ForeignKey("ProductId")]
    public virtual Product Product { get; set; } = null!;
    
    // Constructor para inicializar fechas
    public Offer()
    {
        CreatedAt = DateTime.UtcNow;
    }
    
    // Métodos para cambiar el estado de la oferta
    public void Accept()
    {
        Status = "Aceptada";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Reject()
    {
        Status = "Rechazada";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Cancel()
    {
        Status = "Cancelada";
        UpdatedAt = DateTime.UtcNow;
    }
}
