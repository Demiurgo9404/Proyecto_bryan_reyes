using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoveRose.Core.Models;

public class Transaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(450)] // Tamaño estándar para claves foráneas de Identity
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Column(TypeName = "numeric(18,2)")] // Usar numeric para PostgreSQL
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pendiente"; // Pendiente, Completada, Fallida, Reembolsada
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime TransactionDate { get; set; }
    
    public DateTime? CompletedDate { get; set; }
    
    // Propiedades de navegación
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    [ForeignKey("ProductId")]
    public virtual Product Product { get; set; } = null!;
    
    // Constructor para inicializar fechas
    public Transaction()
    {
        TransactionDate = DateTime.UtcNow;
    }
    
    // Método para marcar la transacción como completada
    public void MarkAsCompleted()
    {
        Status = "Completada";
        CompletedDate = DateTime.UtcNow;
    }
}
